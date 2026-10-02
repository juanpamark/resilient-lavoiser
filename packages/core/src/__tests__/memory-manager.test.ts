import { describe, it, expect } from 'vitest';
import { MemoryManager } from '../conversation/memory-manager.js';
import type { Message, Conversation, Customer } from '../types/index.js';

describe('MemoryManager', () => {
  const manager = new MemoryManager({
    maxHistoryMessages: 5,
    maxEstimatedTokens: 100, // ~400 chars limit
  });

  const mockCustomer: Customer = {
    id: 'cust_1',
    business_id: 'biz_1',
    external_id: '+1234567890',
    channel_type: 'whatsapp',
    display_name: 'Carlos Ruiz',
    phone: '+1234567890',
    profile: {
      preferred_delivery_address: 'Calle 100 #15-20',
      allergies: ['mani', 'mariscos'],
    },
    metadata: {},
    first_seen_at: '2026-01-01T00:00:00Z',
    last_seen_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  };

  const mockConversation: Conversation = {
    id: 'conv_1',
    business_id: 'biz_1',
    agent_id: 'agent_1',
    customer_id: 'cust_1',
    channel_type: 'whatsapp',
    status: 'active',
    assigned_to: null,
    metadata: {
      draft_order: {
        items: [{ product_id: 'prod_1', quantity: 2 }],
      },
    },
    started_at: '2026-01-01T00:00:00Z',
    last_message_at: '2026-01-01T00:00:00Z',
    closed_at: null,
    created_at: '2026-01-01T00:00:00Z',
  };

  it('compactHistory sorts chronologically and slices up to maxHistoryMessages', () => {
    const messages: Message[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `msg_${i}`,
      conversation_id: 'conv_1',
      business_id: 'biz_1',
      role: i % 2 === 0 ? 'user' : 'assistant',
      content_type: 'text',
      content: `Mensaje número ${i}`,
      tool_calls: null,
      tool_results: null,
      channel_metadata: null,
      external_message_id: null,
      input_tokens: null,
      output_tokens: null,
      model_used: null,
      created_at: new Date(2026, 0, 1, 10, i).toISOString(),
    }));

    const compacted = manager.compactHistory(messages);
    expect(compacted).toHaveLength(5);
    // Should retain the latest 5 messages (msg_5 to msg_9)
    expect(compacted[0]?.id).toBe('msg_5');
    expect(compacted[4]?.id).toBe('msg_9');
  });

  it('updateSessionState merges active session data with timestamp', () => {
    const updated = manager.updateSessionState(mockConversation, {
      last_intent: 'order_status_check',
      current_step: 'awaiting_confirmation',
    });

    expect(updated['draft_order']).toBeDefined();
    expect(updated['last_intent']).toBe('order_status_check');
    expect(updated['current_step']).toBe('awaiting_confirmation');
    expect(updated['last_session_update_at']).toBeDefined();
  });

  it('updateCustomerProfile accumulates long-term customer facts', () => {
    const updatedProfile = manager.updateCustomerProfile(mockCustomer, {
      favorite_dish: 'Pizza Margarita',
      payment_method_preference: 'contraentrega',
    });

    expect(updatedProfile['preferred_delivery_address']).toBe('Calle 100 #15-20');
    expect(updatedProfile['favorite_dish']).toBe('Pizza Margarita');
    expect(updatedProfile['last_profile_sync_at']).toBeDefined();
  });

  it('assembleContext bundles all 3 layers for the AI orchestrator', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversation_id: 'conv_1',
        business_id: 'biz_1',
        role: 'user',
        content_type: 'text',
        content: 'Hola, quiero pedir una pizza',
        tool_calls: null,
        tool_results: null,
        channel_metadata: null,
        external_message_id: null,
        input_tokens: null,
        output_tokens: null,
        model_used: null,
        created_at: new Date().toISOString(),
      },
    ];

    const context = manager.assembleContext(mockConversation, mockCustomer, messages);
    expect(context.history).toHaveLength(1);
    expect(context.sessionState['draft_order']).toBeDefined();
    expect(context.customerProfile['allergies']).toEqual(['mani', 'mariscos']);
  });
});
