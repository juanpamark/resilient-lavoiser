import type { WhatsAppSendResult, WhatsAppInteractiveButton } from './types.js';

export interface WhatsAppClientOptions {
  apiVersion?: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class WhatsAppClient {
  private apiVersion: string;
  private baseUrl: string;
  private fetchFn: typeof fetch;

  constructor(options: WhatsAppClientOptions = {}) {
    this.apiVersion = options.apiVersion || 'v21.0';
    this.baseUrl = options.baseUrl || 'https://graph.facebook.com';
    this.fetchFn = options.fetchFn || globalThis.fetch;
  }

  /**
   * Sends a plain text message to a WhatsApp user
   */
  async sendTextMessage(
    phoneNumberId: string,
    to: string,
    text: string,
    accessToken: string
  ): Promise<WhatsAppSendResult> {
    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''),
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    const response = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Meta WhatsApp API error [${response.status}]: ${errorText}`
      );
    }

    return (await response.json()) as WhatsAppSendResult;
  }

  /**
   * Sends an interactive button message (up to 3 quick-reply buttons)
   */
  async sendInteractiveButtons(
    phoneNumberId: string,
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    accessToken: string
  ): Promise<WhatsAppSendResult> {
    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const formattedButtons: WhatsAppInteractiveButton[] = buttons.slice(0, 3).map((b) => ({
      type: 'reply',
      reply: {
        id: b.id,
        title: b.title.slice(0, 20), // Meta limit: 20 chars per button title
      },
    }));

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/[^0-9]/g, ''),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText,
        },
        action: {
          buttons: formattedButtons,
        },
      },
    };

    const response = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Meta WhatsApp API error [${response.status}]: ${errorText}`
      );
    }

    return (await response.json()) as WhatsAppSendResult;
  }

  /**
   * Marks an incoming customer message as read (blue double check)
   */
  async markAsRead(
    phoneNumberId: string,
    messageId: string,
    accessToken: string
  ): Promise<boolean> {
    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    try {
      const response = await this.fetchFn(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
