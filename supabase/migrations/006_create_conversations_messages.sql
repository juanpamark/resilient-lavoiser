-- ==============================================================================
-- Migration 006: Create Conversations and Messages
-- ==============================================================================

-- Table: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  channel_type VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting_for_human', 'human_active', 'closed')),
  assigned_to UUID, -- references memberships or user_id when handed off
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool', 'human_agent')),
  content_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'audio', 'document', 'interactive')),
  content TEXT NOT NULL,
  
  -- Function calling / AI metadata
  tool_calls JSONB,
  tool_results JSONB,
  channel_metadata JSONB,
  external_message_id VARCHAR(255),
  
  -- Token usage & cost attribution
  input_tokens INTEGER,
  output_tokens INTEGER,
  model_used VARCHAR(100),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_conversations_business ON public.conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(business_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_business ON public.messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_external_id ON public.messages(external_message_id);
