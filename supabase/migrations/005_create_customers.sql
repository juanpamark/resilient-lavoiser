-- ==============================================================================
-- Migration 005: Create Customers
-- ==============================================================================

-- Table: customers (End users messaging the businesses)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL, -- WhatsApp Phone Number or external client ID
  channel_type VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
  display_name VARCHAR(255),
  phone VARCHAR(50),
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_customer_per_channel UNIQUE (business_id, channel_type, external_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_lookup ON public.customers(business_id, channel_type, external_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
