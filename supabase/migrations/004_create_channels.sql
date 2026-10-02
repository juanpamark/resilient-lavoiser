-- ==============================================================================
-- Migration 004: Create Channel Connections (Meta WhatsApp Embedded Signup)
-- ==============================================================================

-- Table: channel_connections
CREATE TABLE IF NOT EXISTS public.channel_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('whatsapp', 'instagram', 'messenger', 'webchat', 'telegram')),
  
  -- Meta WhatsApp Cloud API Specific Identifiers
  channel_account_id VARCHAR(255) NOT NULL, -- Phone Number ID in WhatsApp Cloud API
  waba_id VARCHAR(255),                     -- WhatsApp Business Account ID (Client-owned)
  phone_number VARCHAR(50),                 -- Format E.164 (+573001234567)
  
  -- Security and Tokens
  access_token_encrypted TEXT NOT NULL,     -- AES-256-GCM encrypted delegated token
  webhook_verify_token VARCHAR(255) NOT NULL,
  
  -- Operational State & Billing
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'connected', 'failed', 'revoked')),
  billing_type VARCHAR(50) NOT NULL DEFAULT 'client_direct_meta' CHECK (billing_type IN ('client_direct_meta', 'platform_sponsored')),
  
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_channel_account UNIQUE (channel_type, channel_account_id)
);

DROP TRIGGER IF EXISTS set_channel_connections_updated_at ON public.channel_connections;
CREATE TRIGGER set_channel_connections_updated_at
BEFORE UPDATE ON public.channel_connections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indices for webhook event routing and tenant lookups
CREATE INDEX IF NOT EXISTS idx_channel_conn_business_id ON public.channel_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_channel_conn_lookup ON public.channel_connections(channel_type, channel_account_id);
CREATE INDEX IF NOT EXISTS idx_channel_conn_waba ON public.channel_connections(waba_id);
