'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';

type ConversationMode = 'ai_active' | 'human_handoff';
type InboxFilter = 'all' | 'human_handoff' | 'ai_active';
type MessageSender = 'customer' | 'ai_agent' | 'human_staff' | 'system_event';

interface ChatMessage {
  id: string;
  sender: MessageSender;
  authorName: string;
  text: string;
  timestamp: string;
  latencyMs?: number;
  toolExecuted?: string;
}

interface ActiveOrderSummary {
  orderNumber: string;
  status: 'En preparación' | 'En camino' | 'Listo en barra';
  totalCop: number;
  itemsSummary: string;
  elapsedMinutes: number;
}

interface ConversationThread {
  id: string;
  customerName: string;
  customerInitials: string;
  customerPhone: string;
  neighborhood: string;
  mode: ConversationMode;
  handoffReason?: string;
  unreadCount: number;
  lastMessagePreview: string;
  lastActivityTime: string;
  ltvTotalOrders: number;
  ltvTotalSpentCop: number;
  averageTicketCop: number;
  tags: string[];
  kitchenNotes: string;
  activeOrder?: ActiveOrderSummary;
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv-101',
    customerName: 'Carlos Eduardo Ramírez',
    customerInitials: 'CR',
    customerPhone: '+57 314 289 4410',
    neighborhood: 'Santa Cecilia, Engativá',
    mode: 'human_handoff',
    handoffReason: 'Solicitó cambio de dirección y adición post-pago',
    unreadCount: 2,
    lastMessagePreview: '¿Me pueden cambiar las papas fritas por yuca al vapor?',
    lastActivityTime: 'Hace 1m',
    ltvTotalOrders: 14,
    ltvTotalSpentCop: 980000,
    averageTicketCop: 70000,
    tags: ['⭐ VIP', '🥩 Término 3/4', '🚫 Sin cebolla'],
    kitchenNotes:
      'Cliente frecuente de los viernes. Prefiere la salsa chimichurri en recipiente aparte y corte grueso.',
    activeOrder: {
      orderNumber: '#ORD-209',
      status: 'En preparación',
      totalCop: 94000,
      itemsSummary: '1x Punta de Anca 400g (3/4), 1x Chorizo Santarrosano, 2x Club Colombia',
      elapsedMinutes: 12,
    },
    messages: [
      {
        id: 'm-1',
        sender: 'customer',
        authorName: 'Carlos Eduardo Ramírez',
        text: 'Buenas noches, ¿tienen disponible la Punta de Anca de 400g para enviar a Santa Cecilia?',
        timestamp: '19:42',
      },
      {
        id: 'm-2',
        sender: 'ai_agent',
        authorName: 'Agente Agilizio',
        text: '¡Buenas noches, don Carlos! Qué gusto saludarlo de nuevo en Santa Cruz Parrilla. Sí señor, tenemos Punta de Anca madurada de 400g ($58.000). ¿La prefiere en su término habitual 3/4 con papa criolla?',
        timestamp: '19:42',
        latencyMs: 1120,
        toolExecuted: 'search_catalog("punta de anca 400g")',
      },
      {
        id: 'm-3',
        sender: 'customer',
        authorName: 'Carlos Eduardo Ramírez',
        text: 'Sí por favor, término 3/4. Y agrégueme un chorizo santarrosano y dos Club Colombia doradas.',
        timestamp: '19:44',
      },
      {
        id: 'm-4',
        sender: 'ai_agent',
        authorName: 'Agente Agilizio',
        text: 'Perfecto. He registrado su comanda #ORD-209 por un total de $94.000 COP (domicilio incluido a Santa Cecilia). Tiempo estimado: 35 min.',
        timestamp: '19:44',
        latencyMs: 1380,
        toolExecuted: 'create_order_draft(#ORD-209 · $94.000)',
      },
      {
        id: 'm-5',
        sender: 'customer',
        authorName: 'Carlos Eduardo Ramírez',
        text: 'Disculpe, ¿me pueden cambiar las papas por yuca al vapor y enviarlo hoy al apto 402 en vez del 301?',
        timestamp: '19:47',
      },
      {
        id: 'm-6',
        sender: 'system_event',
        authorName: 'Sistema',
        text: 'Handoff activado: Modificación sobre comanda #ORD-209 ya enviada a cocina.',
        timestamp: '19:47',
      },
    ],
  },
  {
    id: 'conv-102',
    customerName: 'Laura Valentina Gómez',
    customerInitials: 'LG',
    customerPhone: '+57 300 812 9033',
    neighborhood: 'Modelia, Fontibón',
    mode: 'ai_active',
    unreadCount: 0,
    lastMessagePreview: 'Listo, confírmame entonces la Picada Familiar para 4.',
    lastActivityTime: 'Hace 3m',
    ltvTotalOrders: 5,
    ltvTotalSpentCop: 460000,
    averageTicketCop: 92000,
    tags: ['🍷 Maridaje Sangría', '🏠 Domicilio Modelia'],
    kitchenNotes: 'Enviar siempre 4 juegos de cubiertos y servilletas extra.',
    activeOrder: {
      orderNumber: '#ORD-210',
      status: 'En preparación',
      totalCop: 118000,
      itemsSummary: '1x Picada Santa Cruz Familiar, 1x Jarra Sangría Artesanal',
      elapsedMinutes: 6,
    },
    messages: [
      {
        id: 'm-201',
        sender: 'customer',
        authorName: 'Laura Valentina Gómez',
        text: 'Hola! ¿Qué trae la Picada Santa Cruz para 4 personas?',
        timestamp: '19:45',
      },
      {
        id: 'm-202',
        sender: 'ai_agent',
        authorName: 'Agente Agilizio',
        text: '¡Hola Laura! La Picada Santa Cruz Familiar ($86.000) incluye 500g de lomo de res, 400g de costilla BBQ, 2 chorizos artesanales, morcilla, papa criolla, arepa boyacense y guacamole fresco. ¿Te gustaría acompañarla con nuestra Jarra de Sangría de la casa ($32.000)?',
        timestamp: '19:45',
        latencyMs: 940,
        toolExecuted: 'search_catalog("picada familiar")',
      },
      {
        id: 'm-203',
        sender: 'customer',
        authorName: 'Laura Valentina Gómez',
        text: 'Listo, confírmame entonces la Picada Familiar para 4 con la jarra de sangría.',
        timestamp: '19:48',
      },
    ],
  },
  {
    id: 'conv-103',
    customerName: 'Andrés Felipe Camargo',
    customerInitials: 'AC',
    customerPhone: '+57 311 540 1928',
    neighborhood: 'Villa Luz, Engativá',
    mode: 'human_handoff',
    handoffReason: 'Consulta por reserva de cumpleaños para 18 personas',
    unreadCount: 1,
    lastMessagePreview: '¿Manejan decoración o descorche de vino para este sábado?',
    lastActivityTime: 'Hace 8m',
    ltvTotalOrders: 2,
    ltvTotalSpentCop: 156000,
    averageTicketCop: 78000,
    tags: ['🎂 Evento / Reserva', '🥩 Baby Beef'],
    kitchenNotes: 'Interesado en mesa larga en el segundo piso para sábado 8:00 PM.',
    messages: [
      {
        id: 'm-301',
        sender: 'customer',
        authorName: 'Andrés Felipe Camargo',
        text: 'Buenas tardes, quiero reservar una mesa para 18 personas este sábado a las 8pm por un cumpleaños. ¿Manejan decoración o descorche?',
        timestamp: '19:40',
      },
      {
        id: 'm-302',
        sender: 'system_event',
        authorName: 'Sistema',
        text: 'Handoff automático: Reserva de grupo mayor a 12 personas requiere aprobación de administrador.',
        timestamp: '19:40',
      },
    ],
  },
  {
    id: 'conv-104',
    customerName: 'Juliana Martínez',
    customerInitials: 'JM',
    customerPhone: '+57 320 491 7762',
    neighborhood: 'Normandía',
    mode: 'ai_active',
    unreadCount: 0,
    lastMessagePreview: '¡Muchas gracias! Quedo atenta al domiciliario.',
    lastActivityTime: 'Hace 19m',
    ltvTotalOrders: 9,
    ltvTotalSpentCop: 585000,
    averageTicketCop: 65000,
    tags: ['⭐ VIP', '🥩 Término Medio'],
    kitchenNotes: 'Alérgica al maní. No incluir salsas con trazas de frutos secos.',
    activeOrder: {
      orderNumber: '#ORD-205',
      status: 'En camino',
      totalCop: 68000,
      itemsSummary: '1x Churrasco Argentino 350g (Medio), 1x Limonada de Coco',
      elapsedMinutes: 24,
    },
    messages: [
      {
        id: 'm-401',
        sender: 'ai_agent',
        authorName: 'Agente Agilizio',
        text: '¡Juliana! Tu pedido #ORD-205 ya salió con nuestro domiciliario hacia Normandía. Llega en aproximadamente 10 minutos.',
        timestamp: '19:30',
        latencyMs: 880,
      },
      {
        id: 'm-402',
        sender: 'customer',
        authorName: 'Juliana Martínez',
        text: '¡Muchas gracias! Quedo atenta al domiciliario.',
        timestamp: '19:31',
      },
    ],
  },
];

const QUICK_TAGS_CATALOG: string[] = [
  '⭐ VIP',
  '🥩 Término 3/4',
  '🥩 Término Medio',
  '🚫 Sin cebolla',
  '🌶️ Ají aparte',
  '🎂 Cumpleaños',
];

function formatCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

export default function BusinessInboxPage() {
  const [conversations, setConversations] = React.useState<ConversationThread[]>(
    INITIAL_CONVERSATIONS
  );
  const [selectedId, setSelectedId] = React.useState<string>('conv-101');
  const [filter, setFilter] = React.useState<InboxFilter>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [draftMessage, setDraftMessage] = React.useState<string>('');
  const [notesSavedIndicator, setNotesSavedIndicator] =
    React.useState<boolean>(false);

  const selectedConversation = React.useMemo(() => {
    return (
      conversations.find((c) => c.id === selectedId) ?? conversations[0]
    );
  }, [conversations, selectedId]);

  const counts = React.useMemo(() => {
    const humanCount = conversations.filter(
      (c) => c.mode === 'human_handoff'
    ).length;
    const aiCount = conversations.filter((c) => c.mode === 'ai_active').length;
    return {
      all: conversations.length,
      human: humanCount,
      ai: aiCount,
    };
  }, [conversations]);

  const filteredConversations = React.useMemo(() => {
    return conversations.filter((conv) => {
      const matchesFilter =
        filter === 'all' ? true : conv.mode === filter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        conv.customerName.toLowerCase().includes(q) ||
        conv.customerPhone.toLowerCase().includes(q) ||
        (conv.activeOrder?.orderNumber.toLowerCase().includes(q) ?? false);

      return matchesFilter && matchesSearch;
    });
  }, [conversations, filter, searchQuery]);

  // Cambiar entre Control Humano e IA en 1 clic
  const handleToggleConversationMode = (targetMode: ConversationMode) => {
    if (!selectedConversation) return;
    const nowTime = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system_event',
      authorName: 'Sistema',
      text:
        targetMode === 'human_handoff'
          ? 'IA pausada por Don Andrés (Caja 1). El personal humano tiene el control del chat.'
          : 'Agente IA Agilizio reactivado. El bot responderá los próximos mensajes automáticamente.',
      timestamp: nowTime,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              mode: targetMode,
              unreadCount: 0,
              messages: [...conv.messages, systemMessage],
            }
          : conv
      )
    );
  };

  // Enviar mensaje como cajero/humano
  const handleSendHumanMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draftMessage.trim();
    if (!trimmed || !selectedConversation) return;

    const nowTime = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'human_staff',
      authorName: 'Don Andrés (Cajero)',
      text: trimmed,
      timestamp: nowTime,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== selectedConversation.id) return conv;
        // Si estaba en IA, al enviar mensaje humano se pasa a Handoff automáticamente
        return {
          ...conv,
          mode: 'human_handoff',
          lastMessagePreview: trimmed,
          lastActivityTime: 'Ahora',
          unreadCount: 0,
          messages: [...conv.messages, newMessage],
        };
      })
    );

    setDraftMessage('');
  };

  // Alternar etiquetas operativas en el Mini-CRM
  const handleToggleTag = (tag: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== selectedConversation.id) return conv;
        const exists = conv.tags.includes(tag);
        const updatedTags = exists
          ? conv.tags.filter((t) => t !== tag)
          : [...conv.tags, tag];
        return { ...conv, tags: updatedTags };
      })
    );
  };

  // Actualizar notas de cocina
  const handleUpdateKitchenNotes = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, kitchenNotes: value }
          : conv
      )
    );
  };

  const handleNotesBlur = () => {
    setNotesSavedIndicator(true);
    window.setTimeout(() => {
      setNotesSavedIndicator(false);
    }, 2000);
  };

  if (!selectedConversation) return null;

  const isAiActive = selectedConversation.mode === 'ai_active';

  return (
    <div className="grid grid-cols-[320px_1fr_300px] h-full w-full overflow-hidden bg-[#FAF8F5]">
      {/* =====================================================================
          COLUMNA 1: LISTA DE CHATS Y FILTROS OPERATIVOS (320px FIJOS)
      ===================================================================== */}
      <section
        aria-label="Lista de conversaciones"
        className="w-[320px] h-full border-r border-[#E8E6DF] bg-[#FAF8F5] flex flex-col overflow-hidden select-none"
      >
        {/* Cabecera de Columna 1: Buscador + Segmented Control */}
        <div className="p-3 border-b border-[#E8E6DF] bg-white space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-[#141413] tracking-[-0.01em]">
              Bandeja de Entrada
            </h1>
            <span className="text-[11px] font-mono metric-mono text-[#8A8884]">
              En vivo · WABA
            </span>
          </div>

          {/* Buscador compacto */}
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 text-[#8A8884] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, +57 o #ORD..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-[#FAF8F5] border border-[#D5D2C8] rounded-md text-[#141413] placeholder:text-[#8A8884] focus:outline-none focus:bg-white focus:border-[#0F291E] transition-colors"
            />
          </div>

          {/* Segmented Control: Todos | 🔥 Humano | 🤖 IA */}
          <div className="grid grid-cols-3 p-0.5 bg-[#F3F1EC] rounded-md border border-[#E8E6DF]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={[
                'h-7 rounded text-[11px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer',
                filter === 'all'
                  ? 'bg-white text-[#141413] shadow-2xs font-semibold'
                  : 'text-[#575653] hover:text-[#141413]',
              ].join(' ')}
            >
              <span>Todos</span>
              <span className="font-mono metric-mono text-[10px] text-[#8A8884]">
                ({counts.all})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('human_handoff')}
              className={[
                'h-7 rounded text-[11px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer',
                filter === 'human_handoff'
                  ? 'bg-white text-[#92400E] shadow-2xs font-semibold'
                  : 'text-[#575653] hover:text-[#141413]',
              ].join(' ')}
            >
              <span>🔥 Humano</span>
              <span className="font-mono metric-mono text-[10px] px-1 rounded bg-amber-500/15 text-[#92400E]">
                {counts.human}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('ai_active')}
              className={[
                'h-7 rounded text-[11px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer',
                filter === 'ai_active'
                  ? 'bg-white text-[#065F46] shadow-2xs font-semibold'
                  : 'text-[#575653] hover:text-[#141413]',
              ].join(' ')}
            >
              <span>🤖 IA</span>
              <span className="font-mono metric-mono text-[10px] text-[#8A8884]">
                ({counts.ai})
              </span>
            </button>
          </div>
        </div>

        {/* Lista scrolleable de conversaciones */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E8E6DF]">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConversation.id;
            const isHandoff = conv.mode === 'human_handoff';

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={[
                  'w-full text-left p-3 transition-colors relative flex flex-col gap-1.5 cursor-pointer',
                  isHandoff
                    ? 'border-l-[3px] border-l-[#D97706]'
                    : 'border-l-[3px] border-l-transparent',
                  isSelected
                    ? 'bg-white shadow-[inset_0_1px_0_0_rgba(20,20,19,0.03)]'
                    : isHandoff
                      ? 'bg-[#FFFBEB]/45 hover:bg-white'
                      : 'hover:bg-white/70',
                ].join(' ')}
              >
                {/* Fila 1: Nombre + Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-[#141413] truncate">
                      {conv.customerName}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="h-4 min-w-4 px-1 rounded-full bg-[#D97706] text-white font-mono metric-mono text-[10px] font-semibold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono metric-mono text-[#8A8884] shrink-0">
                    {conv.lastActivityTime}
                  </span>
                </div>

                {/* Fila 2: Preview del último mensaje */}
                <p className="text-xs text-[#575653] line-clamp-1 leading-snug">
                  {conv.lastMessagePreview}
                </p>

                {/* Fila 3: Estado IA/Humano + Orden activa si existe */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  {isHandoff ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                      HUMANO AL MANDO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                      IA Agilizio
                    </span>
                  )}

                  {conv.activeOrder && (
                    <span className="text-[10px] font-mono metric-mono font-medium text-[#575653] bg-[#F3F1EC] px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                      {conv.activeOrder.orderNumber} ·{' '}
                      {formatCop(conv.activeOrder.totalCop)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          COLUMNA 2: LIENZO DEL CHAT EN VIVO + BARRA DE INTERVENCIÓN (1fr)
      ===================================================================== */}
      <section
        aria-label="Conversación activa"
        className="flex-1 flex flex-col h-full min-w-0 bg-[#FAF8F5] overflow-hidden"
      >
        {/* Barra Superior de Control e Intervención 1-Clic */}
        <header className="h-14 shrink-0 px-5 bg-white border-b border-[#E8E6DF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-[#F3F1EC] border border-[#D5D2C8] flex items-center justify-center text-xs font-semibold text-[#141413] shrink-0">
              {selectedConversation.customerInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#141413] truncate">
                  {selectedConversation.customerName}
                </h2>
                <span className="text-[11px] text-[#575653] bg-[#F3F1EC] px-1.5 py-0.5 rounded border border-[#E8E6DF] truncate">
                  {selectedConversation.neighborhood}
                </span>
              </div>
              <p className="text-[11px] font-mono metric-mono text-[#8A8884] mt-0.5">
                {selectedConversation.customerPhone}
              </p>
            </div>
          </div>

          {/* CONMUTADOR DE HANDOFF HUMANO 1-CLIC */}
          <div className="flex items-center gap-3 shrink-0">
            {isAiActive ? (
              <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#D5D2C8] px-3 py-1.5 rounded-md">
                <StatusPill
                  status="ai_active"
                  label="IA Respondiendo"
                  metric="24/7"
                  pulse
                />
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    handleToggleConversationMode('human_handoff')
                  }
                >
                  Pausar IA · Tomar control
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1.5 rounded-md">
                <StatusPill
                  status="human_handoff"
                  label="Control Humano Activo"
                />
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => handleToggleConversationMode('ai_active')}
                >
                  Reactivar IA
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Sub-barra de Alerta cuando está en Handoff Humano */}
        {!isAiActive && (
          <div className="px-5 py-2 bg-[#FFFBEB] border-b border-[#FDE68A] flex items-center justify-between text-xs text-[#92400E] shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold">
                ⚡ Intervención Humana en Curso:
              </span>
              <span className="truncate">
                {selectedConversation.handoffReason ??
                  'El agente IA está en pausa para evitar pisar tus respuestas.'}
              </span>
            </div>
            <Switch
              size="sm"
              variant="emerald"
              checked={isAiActive}
              onCheckedChange={(checked) =>
                handleToggleConversationMode(
                  checked ? 'ai_active' : 'human_handoff'
                )
              }
              label="Devolver a IA"
            />
          </div>
        )}

        {/* Historial de Mensajes */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {selectedConversation.messages.map((message) => {
            if (message.sender === 'system_event') {
              return (
                <div
                  key={message.id}
                  className="flex items-center justify-center my-2"
                >
                  <div className="px-3 py-1 rounded-full bg-[#F3F1EC] border border-[#E8E6DF] text-[11px] text-[#575653] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                    <span>{message.text}</span>
                    <span className="font-mono metric-mono text-[10px] text-[#8A8884]">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              );
            }

            const isCustomer = message.sender === 'customer';
            const isAi = message.sender === 'ai_agent';

            return (
              <div
                key={message.id}
                className={[
                  'flex flex-col max-w-[78%]',
                  isCustomer ? 'mr-auto items-start' : 'ml-auto items-end',
                ].join(' ')}
              >
                {/* Píldora de Trazabilidad de Herramienta ejecutada por la IA */}
                {isAi && message.toolExecuted && (
                  <div className="mb-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0F291E]/5 border border-[#0F291E]/15 text-[10px] font-mono metric-mono text-[#0F291E]">
                    <span>⚡ Tool:</span>
                    <span className="font-semibold">{message.toolExecuted}</span>
                  </div>
                )}

                {/* Burbuja de Mensaje */}
                <div
                  className={[
                    'px-3.5 py-2.5 text-[13px] leading-relaxed shadow-2xs',
                    isCustomer
                      ? 'bg-white border border-[#E8E6DF] text-[#141413] rounded-lg rounded-tl-xs'
                      : isAi
                        ? 'bg-[#EEF5F1] border border-[#CDE2D6] text-[#0F291E] rounded-lg rounded-tr-xs'
                        : 'bg-[#141413] border border-[#141413] text-[#FAF8F5] rounded-lg rounded-tr-xs',
                  ].join(' ')}
                >
                  <p>{message.text}</p>
                </div>

                {/* Metadatos inferiores de la burbuja */}
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#8A8884]">
                  <span className="font-medium">
                    {isCustomer
                      ? selectedConversation.customerName
                      : isAi
                        ? '🤖 Agente Agilizio'
                        : `👤 ${message.authorName}`}
                  </span>
                  <span>·</span>
                  <span className="font-mono metric-mono">
                    {message.timestamp}
                  </span>
                  {isAi && message.latencyMs && (
                    <>
                      <span>·</span>
                      <span className="font-mono metric-mono text-[#065F46]">
                        {(message.latencyMs / 1000).toFixed(1)}s
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compositor de Respuesta (Cajero / Administrador) */}
        <footer className="p-3.5 bg-white border-t border-[#E8E6DF] shrink-0">
          <form onSubmit={handleSendHumanMessage} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-[#575653]">
                {isAiActive ? (
                  <>
                    🤖 <strong>Modo Automático:</strong> Si envías un mensaje
                    manual, Agilizio pausará la IA automáticamente.
                  </>
                ) : (
                  <>
                    👤 <strong>Respondiendo como Don Andrés (Caja 1)</strong>{' '}
                    vía WhatsApp Cloud API oficial.
                  </>
                )}
              </span>
              <span className="font-mono metric-mono text-[#8A8884]">
                Enter para enviar
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                placeholder={
                  isAiActive
                    ? 'Escribe para intervenir manualmente en la conversación...'
                    : `Escribe un mensaje a ${selectedConversation.customerName}...`
                }
                className="flex-1 h-9 px-3 text-[13px] bg-[#FAF8F5] border border-[#D5D2C8] rounded-md text-[#141413] placeholder:text-[#8A8884] focus:outline-none focus:bg-white focus:border-[#0F291E] transition-colors"
              />
              <Button
                type="submit"
                variant={isAiActive ? 'secondary' : 'primary'}
                size="md"
                disabled={draftMessage.trim().length === 0}
              >
                {isAiActive ? 'Intervenir y Enviar' : 'Enviar a WhatsApp'}
              </Button>
            </div>
          </form>
        </footer>
      </section>

      {/* =====================================================================
          COLUMNA 3: FICHA DE CLIENTE / MINI-CRM GASTRONÓMICO (300px FIJOS)
      ===================================================================== */}
      <aside
        aria-label="Ficha de cliente Mini-CRM"
        className="w-[300px] h-full border-l border-[#E8E6DF] bg-white flex flex-col overflow-y-auto divide-y divide-[#E8E6DF]"
      >
        {/* Bloque 1: Valor de Vida del Cliente (LTV) */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8884]">
              Ficha de Comensal
            </span>
            <span className="text-[11px] font-mono metric-mono text-[#0F291E] font-semibold bg-[#EEF5F1] px-2 py-0.5 rounded border border-[#CDE2D6]">
              ID #{selectedConversation.id.replace('conv-', '')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
              <span className="text-[10px] text-[#8A8884] block">
                Ventas Acumuladas
              </span>
              <span className="text-sm font-semibold font-mono metric-mono text-[#141413] mt-0.5 block">
                {formatCop(selectedConversation.ltvTotalSpentCop)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF]">
              <span className="text-[10px] text-[#8A8884] block">
                Pedidos / Ticket Prom.
              </span>
              <span className="text-sm font-semibold font-mono metric-mono text-[#141413] mt-0.5 block">
                {selectedConversation.ltvTotalOrders} ·{' '}
                {formatCop(selectedConversation.averageTicketCop)}
              </span>
            </div>
          </div>
        </div>

        {/* Bloque 2: Comanda Activa en Curso (KDS Link) */}
        {selectedConversation.activeOrder && (
          <div className="p-4 space-y-2.5 bg-[#FAF8F5]/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8884]">
                Comanda en Curso
              </span>
              <StatusPill
                status="kitchen_alert"
                label={selectedConversation.activeOrder.status}
                metric={`${selectedConversation.activeOrder.elapsedMinutes}m`}
              />
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#D5D2C8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono metric-mono font-bold text-[#141413]">
                  {selectedConversation.activeOrder.orderNumber}
                </span>
                <span className="text-xs font-mono metric-mono font-semibold text-[#0F291E]">
                  {formatCop(selectedConversation.activeOrder.totalCop)}
                </span>
              </div>

              <p className="text-xs text-[#575653] leading-snug">
                {selectedConversation.activeOrder.itemsSummary}
              </p>
            </div>
          </div>
        )}

        {/* Bloque 3: Etiquetas Operativas y Preferencias de Parrilla */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8884]">
              Etiquetas Operativas
            </span>
            <span className="text-[10px] text-[#8A8884]">Clic para alternar</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS_CATALOG.map((tag) => {
              const isSelectedTag = selectedConversation.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={[
                    'px-2 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer select-none',
                    isSelectedTag
                      ? 'bg-[#0F291E] text-[#FAF8F5] border-[#0F291E] shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#575653] border-[#E8E6DF] hover:border-[#D5D2C8]',
                  ].join(' ')}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bloque 4: Notas Técnicas de Cocina y Alergias */}
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor="kitchen-notes-textarea"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8884]"
            >
              Notas de Cocina y Domicilio
            </label>
            {notesSavedIndicator && (
              <span className="text-[10px] font-mono metric-mono text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                ✓ Guardado
              </span>
            )}
          </div>

          <textarea
            id="kitchen-notes-textarea"
            rows={5}
            value={selectedConversation.kitchenNotes}
            onChange={handleUpdateKitchenNotes}
            onBlur={handleNotesBlur}
            placeholder="Ej: Término preferido, alergias, indicaciones de portería..."
            className="w-full p-2.5 rounded-lg bg-[#FAF6EE] border border-[#E6DEC8] text-xs font-mono text-[#141413] placeholder:text-[#8A8884] leading-relaxed focus:outline-none focus:border-[#D97706] resize-none"
          />
          <p className="text-[10px] text-[#8A8884] leading-normal">
            Estas notas se inyectan automáticamente en el contexto del Agente IA
            cuando el comensal vuelve a escribir.
          </p>
        </div>
      </aside>
    </div>
  );
}
