'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Bot,
  UserCheck,
  RotateCcw,
  CheckCircle,
  Send,
  Phone,
  AlertCircle,
  Wifi,
  Users,
  BellRing,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeInbox } from '@/lib/realtime/use-realtime-inbox';
import {
  getInboxConversationsAction,
  sendHumanMessageAction,
  claimConversationAction,
  releaseToBotAction,
  closeConversationAction,
  type InboxConversation,
  type InboxMessage,
} from '@/lib/actions/chat.actions';
import { playHandoffAlertSound } from '@/lib/realtime/sound-alerts';

export default function BusinessInboxPage() {
  const [chats, setChats] = useState<InboxConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('conv_sc_2');
  const [filter, setFilter] = useState<'all' | 'waiting' | 'human' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const businessId = '00000000-0000-0000-0000-000000000001';

  // Load conversations from Supabase
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getInboxConversationsAction();
      if (res.success && res.data) {
        setChats(res.data);
        if (res.data.length > 0 && !res.data.some((c) => c.id === selectedChatId)) {
          setSelectedChatId(res.data[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedChatId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle incoming realtime message
  const handleRealtimeMessage = useCallback((msg: any) => {
    if (!msg) return;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === msg.conversation_id) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...c,
            lastMessage: msg.content,
            time,
            messages: [
              ...c.messages,
              {
                id: msg.id || `rt_${Date.now()}`,
                role: msg.role,
                content: msg.content,
                time,
              },
            ],
          };
        }
        return c;
      })
    );
  }, []);

  // Handle realtime conversation update
  const handleRealtimeConversation = useCallback((conv: any) => {
    if (!conv) return;
    setChats((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, status: conv.status } : c))
    );
  }, []);

  // Connect to Supabase Realtime & Presence
  const { connectionStatus, activeOperators } = useRealtimeInbox({
    businessId,
    operatorEmail: 'admin@agilizio.com',
    activeConversationId: selectedChatId,
    onNewMessage: handleRealtimeMessage,
    onConversationUpdate: handleRealtimeConversation,
  });

  const activeChat = chats.find((c) => c.id === selectedChatId) || chats[0];

  // Operator takes control: triggers state machine transition & mutes AI
  const handleTakeControl = async (chatId: string) => {
    await claimConversationAction({ conversationId: chatId, operatorId: 'op_admin' });
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              status: 'human_active',
              messages: [
                ...c.messages,
                {
                  id: `sys_${Date.now()}`,
                  role: 'human_agent',
                  content:
                    '👋 Has tomado el control de la conversación. El bot de IA está silenciado.',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : c
      )
    );
  };

  // Operator releases control back to AI
  const handleReleaseToBot = async (chatId: string) => {
    await releaseToBotAction({ conversationId: chatId });
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              status: 'active',
              messages: [
                ...c.messages,
                {
                  id: `sys_${Date.now()}`,
                  role: 'assistant',
                  content:
                    '🤖 Has devuelto la atención al agente de IA. Continuará respondiendo automáticamente.',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : c
      )
    );
  };

  // Close conversation
  const handleCloseChat = async (chatId: string) => {
    await closeConversationAction({ conversationId: chatId });
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, status: 'closed' } : c))
    );
  };

  // Send human message via Server Action to WhatsApp Cloud API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat || isSending) return;

    const content = newMessageText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsSending(true);

    try {
      // 1. Dispatch via Server Action to WhatsApp Cloud API and Supabase
      await sendHumanMessageAction({
        conversationId: activeChat.id,
        businessId,
        content,
        customerPhone: activeChat.phone,
        operatorId: 'op_admin',
      });

      // 2. Optimistic UI update
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChat.id) {
            return {
              ...c,
              status: 'human_active',
              lastMessage: content,
              time,
              messages: [
                ...c.messages,
                {
                  id: `msg_${Date.now()}`,
                  role: 'human_agent',
                  content,
                  time,
                },
              ],
            };
          }
          return c;
        })
      );

      setNewMessageText('');
    } finally {
      setIsSending(false);
    }
  };

  // Counts for filter pills
  const waitingCount = chats.filter((c) => c.status === 'waiting_for_human').length;
  const humanCount = chats.filter((c) => c.status === 'human_active').length;
  const aiCount = chats.filter((c) => c.status === 'active').length;

  const filteredChats = chats.filter((c) => {
    if (filter === 'waiting') return c.status === 'waiting_for_human';
    if (filter === 'human') return c.status === 'human_active';
    if (filter === 'ai') return c.status === 'active';
    return true;
  }).filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      c.customerName.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.lastMessage.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex h-[calc(100vh)] overflow-hidden bg-white">
      {/* Left Chat List Column */}
      <div className="w-80 lg:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
        {/* Search & Header with Realtime status */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Bandeja en Vivo</h2>
              <p className="text-[11px] text-slate-500">Restaurante Santa Cruz</p>
            </div>
            {/* Realtime WebSocket Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Realtime Activo</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, teléfono o plato..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Pills with dynamic counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Todos ({chats.length})
            </button>
            <button
              onClick={() => setFilter('waiting')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filter === 'waiting'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              Espera ({waitingCount})
            </button>
            <button
              onClick={() => setFilter('human')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filter === 'human'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              Humano ({humanCount})
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filter === 'ai'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              IA ({aiCount})
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading && chats.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando conversaciones...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay conversaciones en esta categoría
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              const isWaiting = chat.status === 'waiting_for_human';

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 cursor-pointer transition-colors relative ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                      : isWaiting
                      ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {chat.customerName}
                      </span>
                      {isWaiting && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{chat.time}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mb-2">{chat.phone}</div>
                  <p className="text-xs text-slate-600 truncate mb-2">{chat.lastMessage}</p>

                  <div className="flex items-center justify-between">
                    {chat.status === 'active' && (
                      <Badge variant="success">
                        <Bot className="w-3 h-3 inline mr-1" /> IA Atendiendo
                      </Badge>
                    )}
                    {chat.status === 'waiting_for_human' && (
                      <Badge variant="warning">
                        <AlertCircle className="w-3 h-3 inline mr-1" /> Esperando Asesor
                      </Badge>
                    )}
                    {chat.status === 'human_active' && (
                      <Badge variant="purple">
                        <UserCheck className="w-3 h-3 inline mr-1" /> Asesor en Control
                      </Badge>
                    )}
                    {chat.status === 'closed' && <Badge variant="outline">Cerrada</Badge>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Thread Column */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50">
          {/* Active Chat Header with Presence */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                {activeChat.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{activeChat.customerName}</h3>
                  {activeChat.status === 'active' && (
                    <Badge variant="success">🤖 IA Activa</Badge>
                  )}
                  {activeChat.status === 'waiting_for_human' && (
                    <Badge variant="warning">⚠️ Espera de Asesor</Badge>
                  )}
                  {activeChat.status === 'human_active' && (
                    <Badge variant="purple">👤 Asesor Humano (Bot Silenciado)</Badge>
                  )}
                  {activeChat.status === 'closed' && <Badge variant="outline">Cerrada</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {activeChat.phone}
                  </span>
                  {/* Presence indicator */}
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-sans font-medium">
                    <Users className="w-3 h-3 text-emerald-600" /> 1 asesor en línea
                  </span>
                </div>
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => playHandoffAlertSound()}
                title="Probar sonido de notificación"
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <BellRing className="w-4 h-4" />
              </button>

              {activeChat.status !== 'human_active' && (
                <button
                  onClick={() => handleTakeControl(activeChat.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Tomar Control
                </button>
              )}

              {activeChat.status === 'human_active' && (
                <button
                  onClick={() => handleReleaseToBot(activeChat.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Devolver a IA
                </button>
              )}

              {activeChat.status !== 'closed' && (
                <button
                  onClick={() => handleCloseChat(activeChat.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Cerrar
                </button>
              )}
            </div>
          </div>

          {/* Muting or Handoff Banner */}
          {activeChat.status === 'human_active' ? (
            <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 flex items-center justify-between text-xs text-purple-900">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                <strong>Bot Silenciado:</strong> Estás atendiendo manualmente a este comensal. Las respuestas se envían a su WhatsApp.
              </span>
              <button
                onClick={() => handleReleaseToBot(activeChat.id)}
                className="underline font-semibold hover:text-purple-950"
              >
                Reactivar IA ahora
              </button>
            </div>
          ) : activeChat.status === 'waiting_for_human' ? (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 animate-pulse">
              <span className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <strong>Atención Requerida:</strong> El comensal solicitó hablar con un asesor. Haz clic en "Tomar Control" para responder.
              </span>
              <button
                onClick={() => handleTakeControl(activeChat.id)}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Atender Ahora
              </button>
            </div>
          ) : null}

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeChat.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isBot = msg.role === 'assistant';
              const isHumanAgent = msg.role === 'human_agent';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                    {isBot && (
                      <span className="font-semibold text-blue-600 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> IA Gemini
                      </span>
                    )}
                    {isHumanAgent && (
                      <span className="font-semibold text-purple-600 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Operador Humano (Enviado por WhatsApp)
                      </span>
                    )}
                    {isUser && <span className="font-semibold text-slate-600">Comensal</span>}
                    <span>• {msg.time}</span>
                  </div>

                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                        : isBot
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                        : 'bg-purple-700 text-white rounded-tr-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Box with direct WhatsApp delivery */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessageText}
                disabled={isSending}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={
                  activeChat.status === 'human_active'
                    ? 'Escribe tu respuesta para enviarla al WhatsApp del comensal...'
                    : 'Escribe un mensaje (tomarás el control y silenciarás al bot automáticamente)...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim() || isSending}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Enviando...' : 'Enviar a WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Selecciona una conversación para abrir el chat
        </div>
      )}
    </div>
  );
}
