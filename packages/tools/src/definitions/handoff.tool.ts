import { z } from 'zod';
import type { ToolDefinition } from '../types/tool.interface.js';

export const TransferToHumanSchema = z.object({
  reason: z.string().describe('Motivo claro por el cual se requiere la intervención humana'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium').describe('Nivel de urgencia del caso'),
  summary_for_agent: z.string().describe('Resumen breve de la conversación para que el agente humano entre en contexto de inmediato'),
});

export type TransferToHumanArgs = z.infer<typeof TransferToHumanSchema>;

export const transferToHumanTool: ToolDefinition<TransferToHumanArgs> = {
  name: 'transfer_to_human',
  description: 'Transfiere la conversación a un asesor humano cuando el cliente lo solicita expresamente o cuando una queja no puede ser resuelta automáticamente.',
  schema: TransferToHumanSchema,
  category: 'support',
  async execute(args, context) {
    return {
      transferred: true,
      status: 'waiting_for_human',
      conversation_id: context.conversationId,
      business_id: context.businessId,
      reason: args.reason,
      urgency: args.urgency,
      handoff_message: 'He transferido tu conversación a un asesor de nuestro equipo. En breve te responderá por este mismo medio.',
    };
  },
};
