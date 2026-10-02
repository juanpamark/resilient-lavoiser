import { z } from 'zod';
import type { ToolDefinition } from '../types/tool.interface.js';

export const GetBusinessInfoSchema = z.object({
  include_hours: z.boolean().default(true).describe('Incluir horarios de atención en la respuesta'),
  include_policies: z.boolean().default(true).describe('Incluir políticas de cancelación y entrega'),
});

export type GetBusinessInfoArgs = z.infer<typeof GetBusinessInfoSchema>;

export const getBusinessInfoTool: ToolDefinition<GetBusinessInfoArgs> = {
  name: 'get_business_information',
  description: 'Obtiene información oficial del negocio: descripción, dirección, horarios de atención y políticas de servicio.',
  schema: GetBusinessInfoSchema,
  category: 'business',
  async execute(args, context) {
    // In production, queries the database scoped to context.businessId
    return {
      business_id: context.businessId,
      status: 'active',
      details: 'Información general recuperada con éxito.',
      include_hours: args.include_hours,
      include_policies: args.include_policies,
    };
  },
};
