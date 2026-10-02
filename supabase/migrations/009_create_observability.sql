-- ==============================================================================
-- Migration 009: Observability, AI Usage, Tool Execution & Webhook Audit Logs
-- ==============================================================================

-- Table: webhook_events (Incoming event persistence & idempotency)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type VARCHAR(50) NOT NULL,
  external_message_id VARCHAR(255) NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed')),
  raw_payload JSONB NOT NULL,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_webhook_event UNIQUE (channel_type, external_message_id)
);

-- Table: ai_usage_logs (Granular tracking of token consumption & costs)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL, -- e.g. 'gemini'
  model VARCHAR(100) NOT NULL,   -- e.g. 'gemini-2.0-flash'
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  tool_calls_count INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: tool_execution_logs (Traceability for function calling)
CREATE TABLE IF NOT EXISTS public.tool_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  tool_name VARCHAR(100) NOT NULL,
  input_params JSONB NOT NULL,
  result_success BOOLEAN NOT NULL DEFAULT true,
  result_data JSONB,
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: audit_logs (Administrative actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for reporting and monitoring
CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON public.webhook_events(channel_type, external_message_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_business_date ON public.ai_usage_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_exec_business ON public.tool_execution_logs(business_id, tool_name);
CREATE INDEX IF NOT EXISTS idx_audit_business ON public.audit_logs(business_id, created_at DESC);
