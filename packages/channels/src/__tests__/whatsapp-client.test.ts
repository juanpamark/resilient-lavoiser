import { describe, it, expect, vi } from 'vitest';
import { WhatsAppClient } from '../whatsapp/whatsapp-client.js';

describe('WhatsAppClient', () => {
  it('sends text message with valid Meta Graph API v21.0 payload', async () => {
    let capturedUrl = '';
    let capturedOptions: any = null;

    const mockFetch = vi.fn().mockImplementation(async (url, options) => {
      capturedUrl = url.toString();
      capturedOptions = options;
      return {
        ok: true,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '573001234567', wa_id: '573001234567' }],
          messages: [{ id: 'wamid.HBgM98765' }],
        }),
      };
    });

    const client = new WhatsAppClient({ fetchFn: mockFetch as any });
    const result = await client.sendTextMessage(
      '105551234567890',
      '+57 300 123 4567',
      '¡Hola! Tu pedido ha sido confirmado.',
      'meta_access_token_123'
    );

    expect(capturedUrl).toBe('https://graph.facebook.com/v21.0/105551234567890/messages');
    expect(capturedOptions.headers['Authorization']).toBe('Bearer meta_access_token_123');

    const body = JSON.parse(capturedOptions.body);
    expect(body.messaging_product).toBe('whatsapp');
    expect(body.to).toBe('573001234567');
    expect(body.type).toBe('text');
    expect(body.text.body).toBe('¡Hola! Tu pedido ha sido confirmado.');
    expect(result.messages[0]?.id).toBe('wamid.HBgM98765');
  });

  it('sends interactive button message with properly formatted buttons', async () => {
    let capturedOptions: any = null;

    const mockFetch = vi.fn().mockImplementation(async (_url, options) => {
      capturedOptions = options;
      return {
        ok: true,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '573001234567', wa_id: '573001234567' }],
          messages: [{ id: 'wamid.HBgM98766' }],
        }),
      };
    });

    const client = new WhatsAppClient({ fetchFn: mockFetch as any });
    await client.sendInteractiveButtons(
      '105551234567890',
      '573001234567',
      '¿Deseas confirmar tu orden?',
      [
        { id: 'btn_confirm', title: 'Sí, confirmar' },
        { id: 'btn_cancel', title: 'Cancelar' },
      ],
      'meta_access_token_123'
    );

    const body = JSON.parse(capturedOptions.body);
    expect(body.type).toBe('interactive');
    expect(body.interactive.type).toBe('button');
    expect(body.interactive.body.text).toBe('¿Deseas confirmar tu orden?');
    expect(body.interactive.action.buttons).toHaveLength(2);
    expect(body.interactive.action.buttons[0].reply.id).toBe('btn_confirm');
    expect(body.interactive.action.buttons[0].reply.title).toBe('Sí, confirmar');
  });

  it('marks incoming message as read', async () => {
    let capturedOptions: any = null;

    const mockFetch = vi.fn().mockImplementation(async (_url, options) => {
      capturedOptions = options;
      return { ok: true };
    });

    const client = new WhatsAppClient({ fetchFn: mockFetch as any });
    const success = await client.markAsRead(
      '105551234567890',
      'wamid.incoming123',
      'meta_access_token_123'
    );

    expect(success).toBe(true);
    const body = JSON.parse(capturedOptions.body);
    expect(body.status).toBe('read');
    expect(body.message_id).toBe('wamid.incoming123');
  });

  it('throws informative error on Meta API failure', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: false,
        status: 401,
        text: async () => '{"error": {"message": "Invalid OAuth access token."}}',
      };
    });

    const client = new WhatsAppClient({ fetchFn: mockFetch as any });
    await expect(
      client.sendTextMessage('10555', '57300', 'hola', 'bad_token')
    ).rejects.toThrow('Meta WhatsApp API error [401]');
  });
});
