-- ==============================================================================
-- Migration 003: Create Agents and Versioned Agent Configurations
-- ==============================================================================

-- Table: agents
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_agents_updated_at ON public.agents;
CREATE TRIGGER set_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Table: agent_configs (Versioned configurations per agent)
CREATE TABLE IF NOT EXISTS public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Modular Prompt Structure
  system_instructions TEXT NOT NULL,
  personality JSONB NOT NULL DEFAULT '{"tone": "amable y profesional", "language": "es-CO"}'::jsonb,
  business_context JSONB NOT NULL DEFAULT '{"overview": "", "faq": []}'::jsonb,
  policies JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Tooling & Model Configuration
  enabled_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_config JSONB NOT NULL DEFAULT '{"provider": "gemini", "model": "gemini-2.0-flash", "temperature": 0.7, "maxOutputTokens": 2048}'::jsonb,
  out_of_hours_behavior VARCHAR(50) NOT NULL DEFAULT 'bot_responds' CHECK (out_of_hours_behavior IN ('auto_reply', 'bot_responds', 'silent')),
  human_handoff_trigger TEXT DEFAULT 'Solicitud explícita de agente humano',
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_agent_config_version UNIQUE (agent_id, version)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_agents_business_id ON public.agents(business_id);
CREATE INDEX IF NOT EXISTS idx_agent_configs_lookup ON public.agent_configs(agent_id, is_active);
