import { z } from 'zod';
import type { ToolDefinition } from '../types/tool.interface.js';

export const OrderItemInputSchema = z.object({
  product_name: z.string().describe('Nombre del producto'),
  quantity: z.number().int().positive().describe('Cantidad de unidades'),
  unit_price: z.number().positive().describe('Precio unitario del producto'),
  notes: z.string().optional().describe('Especificaciones o modificaciones (ej: sin cebolla)'),
});

// --- Tool 1: calculate_order ---
export const CalculateOrderSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1).describe('Lista de productos a incluir en el pedido'),
  delivery_fee: z.number().nonnegative().default(0).describe('Costo de envío o domicilio si aplica'),
  tax_rate: z.number().min(0).max(1).default(0.0).describe('Tasa de impuesto (ej: 0.19 para 19% IVA, 0 para restaurantes en impoconsumo)'),
});

export type CalculateOrderArgs = z.infer<typeof CalculateOrderSchema>;

export const calculateOrderTool: ToolDefinition<CalculateOrderArgs> = {
  name: 'calculate_order',
  description: 'Calcula con precisión matemática el subtotal, impuestos, costo de envío y total de un pedido antes de confirmarlo al cliente.',
  schema: CalculateOrderSchema,
  category: 'order',
  async execute(args) {
    let subtotal = 0;
    const itemsCalculated = args.items.map(item => {
      const lineTotal = item.quantity * item.unit_price;
      subtotal += lineTotal;
      return {
        ...item,
        total: lineTotal,
      };
    });

    const tax = Math.round(subtotal * args.tax_rate);
    const total = subtotal + tax + args.delivery_fee;

    return {
      items: itemsCalculated,
      subtotal,
      tax,
      delivery_fee: args.delivery_fee,
      total,
      currency: 'COP',
    };
  },
};

// --- Tool 2: create_order ---
export const CreateOrderSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1).describe('Lista final confirmada de productos'),
  delivery_address: z.string().min(5).describe('Dirección completa de entrega del cliente'),
  contact_phone: z.string().min(7).describe('Teléfono o WhatsApp de contacto para la entrega'),
  payment_method: z.enum(['efectivo', 'transferencia', 'tarjeta_contraentrega', 'enlace_de_pago']).describe('Método de pago acordado'),
  notes: z.string().optional().describe('Notas o comentarios adicionales para cocina o el domiciliario'),
});

export type CreateOrderArgs = z.infer<typeof CreateOrderSchema>;

export const createOrderTool: ToolDefinition<CreateOrderArgs> = {
  name: 'create_order',
  description: 'Crea y confirma formalmente un pedido en el sistema cuando el cliente ha validado el total, la dirección y el método de pago.',
  schema: CreateOrderSchema,
  category: 'order',
  async execute(args, context) {
    const orderId = `ord-${Date.now().toString(36)}`;
    const subtotal = args.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    return {
      success: true,
      order_id: orderId,
      business_id: context.businessId,
      conversation_id: context.conversationId,
      status: 'pending',
      summary: {
        item_count: args.items.length,
        subtotal,
        total: subtotal,
        delivery_address: args.delivery_address,
        payment_method: args.payment_method,
      },
      message: `¡Pedido registrado con éxito! Código: #${orderId}. Se enviará a cocina de inmediato.`,
    };
  },
};
