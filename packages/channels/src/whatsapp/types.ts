/**
 * Meta WhatsApp Cloud API v21.0 Webhook and Messaging Type Definitions
 */

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppProfile {
  name: string;
}

export interface WhatsAppContact {
  profile: WhatsAppProfile;
  wa_id: string; // Customer's phone number without + or special chars
}

export interface WhatsAppTextMessage {
  body: string;
}

export interface WhatsAppInteractiveReply {
  id: string;
  title: string;
}

export interface WhatsAppInteractiveResponse {
  type: 'button_reply' | 'list_reply';
  button_reply?: WhatsAppInteractiveReply;
  list_reply?: WhatsAppInteractiveReply;
}

export interface WhatsAppIncomingMessage {
  from: string; // Customer phone number
  id: string; // e.g. "wamid.HBgM..."
  timestamp: string;
  type: 'text' | 'interactive' | 'image' | 'audio' | 'document' | 'unsupported';
  text?: WhatsAppTextMessage;
  interactive?: WhatsAppInteractiveResponse;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
  }>;
}

export interface WhatsAppStatus {
  id: string; // message id
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin?: {
      type: string;
    };
  };
}

export interface WhatsAppValue {
  messaging_product: 'whatsapp';
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppIncomingMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: 'messages';
}

export interface WhatsAppEntry {
  id: string; // WABA ID
  changes: WhatsAppChange[];
}

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppEntry[];
}

export interface WhatsAppSendResult {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppInteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}
