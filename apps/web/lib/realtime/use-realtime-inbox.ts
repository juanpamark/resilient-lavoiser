'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { playHandoffAlertSound, playMessageReceivedSound } from './sound-alerts';

export interface PresenceOperator {
  user: string;
  onlineAt: string;
  viewingChatId?: string;
}

export interface UseRealtimeInboxOptions {
  businessId: string;
  operatorEmail?: string;
  activeConversationId?: string;
  onNewMessage?: (message: any) => void;
  onConversationUpdate?: (conversation: any) => void;
}

export function useRealtimeInbox({
  businessId,
  operatorEmail = 'operador@lacasona.com',
  activeConversationId,
  onNewMessage,
  onConversationUpdate,
}: UseRealtimeInboxOptions) {
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('connecting');
  const [activeOperators, setActiveOperators] = useState<PresenceOperator[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `inbox_${businessId}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: operatorEmail,
        },
      },
    });

    // 1. Listen for new messages inserted in Realtime
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        const newMsg = payload.new;
        if (newMsg?.role === 'user') {
          playMessageReceivedSound();
        }
        if (onNewMessage) {
          onNewMessage(newMsg);
        }
      }
    );

    // 2. Listen for conversation state updates (e.g. handoff to waiting_for_human)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        const updated = payload.new;
        if (updated?.status === 'waiting_for_human') {
          playHandoffAlertSound();
        }
        if (onConversationUpdate) {
          onConversationUpdate(updated);
        }
      }
    );

    // 3. Supabase Presence tracking to see active operators
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const operators: PresenceOperator[] = [];
        for (const [key, presences] of Object.entries(state)) {
          const latest: any = (presences as any[])[0];
          if (latest) {
            operators.push({
              user: key,
              onlineAt: latest.onlineAt || new Date().toISOString(),
              viewingChatId: latest.viewingChatId,
            });
          }
        }
        setActiveOperators(operators);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log(`[Presence] Asesor conectado: ${key}`);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log(`[Presence] Asesor desconectado: ${key}`);
      });

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected');
        channel.track({
          user: operatorEmail,
          onlineAt: new Date().toISOString(),
          viewingChatId: activeConversationId,
        });
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connecting');
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, operatorEmail, onNewMessage, onConversationUpdate]);

  // Update presence tracking when active conversation changes
  useEffect(() => {
    if (channelRef.current && connectionStatus === 'connected') {
      channelRef.current.track({
        user: operatorEmail,
        onlineAt: new Date().toISOString(),
        viewingChatId: activeConversationId,
      });
    }
  }, [activeConversationId, connectionStatus, operatorEmail]);

  return {
    connectionStatus,
    activeOperators,
  };
}
