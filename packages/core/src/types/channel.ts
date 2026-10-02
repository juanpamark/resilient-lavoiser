/**
 * Channel connection types and definitions
 * Fully incorporates Meta WhatsApp Cloud API Embedded Signup
 */

export type ChannelType = 'whatsapp' | 'instagram' | 'messenger' | 'webchat' | 'telegram';

export type OnboardingStatus = 'pending' | 'connected' | 'failed' | 'revoked';

export type BillingType = 'client_direct_meta' | 'platform_sponsored';

export interface ChannelConnection {
  id: string; // UUID v7
  business_id: string; // UUID v7
  channel_type: ChannelType;
  
  // Specific WhatsApp / Meta Cloud API Identifiers
  channel_account_id: string; // Maps to phone_number_id in WhatsApp Cloud API
  waba_id: string | null; // WhatsApp Business Account ID owned by the client
  phone_number: string | null; // E.164 phone number e.g. "+573001234567"
  
  // Security & Authentication
  access_token_encrypted: string; // Delegated System User Token (AES-256-GCM encrypted)
  webhook_verify_token: string; // Verification token for webhook handshake
  
  // Lifecycle & State
  is_active: boolean;
  onboarding_status: OnboardingStatus;
  billing_type: BillingType; // Defaults to 'client_direct_meta' (client pays Meta directly)
  
  // Extensible configuration (e.g., Meta App ID, display phone name, certificate details)
  config: Record<string, unknown>;
  
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetaEmbeddedSignupPayload {
  code: string; // OAuth exchange code returned by Meta Embedded Signup popup
  waba_id: string;
  phone_number_id: string;
  business_id: string;
}
