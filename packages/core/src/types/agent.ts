/**
 * AI Agent definitions
 */

export type AgentStatus = 'active' | 'inactive' | 'training';

export interface ModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
}

export interface AgentConfig {
  id: string; // UUID v7
  agent_id: string; // UUID v7
  version: number;
  
  // Modular prompt sections
  system_instructions: string;
  personality: {
    tone: string; // e.g. "amable", "profesional", "cercano"
    language: string; // e.g. "es-CO", "es-MX", "en-US"
  };
  business_context: {
    overview: string;
    faq: Array<{ question: string; answer: string }>;
  };
  policies: {
    return_policy?: string;
    cancellation_policy?: string;
    special_notes?: string;
  };
  
  // Behavioral and tool controls
  enabled_tools: string[]; // List of registered tool names
  model_config: ModelConfig;
  out_of_hours_behavior: 'auto_reply' | 'bot_responds' | 'silent';
  human_handoff_trigger: string;
  
  is_active: boolean;
  created_at: string;
}

export interface Agent {
  id: string; // UUID v7
  business_id: string; // UUID v7
  name: string;
  status: AgentStatus;
  current_config?: AgentConfig;
  created_at: string;
  updated_at: string;
}
