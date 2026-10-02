/**
 * @platform/channels - Multi-Channel Abstraction (WhatsApp Cloud API with Embedded Signup, Instagram, etc.)
 */

export const CHANNELS_LAYER_VERSION = '0.1.0';

export interface ChannelMessageContext {
  channelType: string;
  businessId: string;
  wabaId?: string;
  phoneNumberId?: string;
}

export * from './whatsapp/index.js';
