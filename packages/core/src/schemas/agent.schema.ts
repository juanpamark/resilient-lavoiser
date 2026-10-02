import { z } from 'zod';

export const ModelConfigSchema = z.object({
  provider: z.enum(['gemini', 'openai', 'anthropic']).default('gemini'),
  model: z.string().default('gemini-2.0-flash'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxOutputTokens: z.number().min(100).max(8192).default(2048),
  topP: z.number().min(0).max(1).optional(),
});

export const AgentConfigSchema = z.object({
  system_instructions: z.string().min(10, 'System instructions required'),
  personality: z.object({
    tone: z.string().default('amable y profesional'),
    language: z.string().default('es-CO'),
  }),
  business_context: z.object({
    overview: z.string().default(''),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
  }),
  policies: z.object({
    return_policy: z.string().optional(),
    cancellation_policy: z.string().optional(),
    special_notes: z.string().optional(),
  }),
  enabled_tools: z.array(z.string()).default([]),
  model_config: ModelConfigSchema.default({}),
  out_of_hours_behavior: z.enum(['auto_reply', 'bot_responds', 'silent']).default('bot_responds'),
  human_handoff_trigger: z.string().default('Solicitud explícita de agente humano'),
});

export const CreateAgentSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(2, 'Agent name required'),
  config: AgentConfigSchema,
});

export type AgentConfigInput = z.infer<typeof AgentConfigSchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
