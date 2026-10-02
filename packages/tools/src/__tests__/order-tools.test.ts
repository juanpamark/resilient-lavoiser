import { describe, it, expect } from 'vitest';
import { calculateOrderTool, createOrderTool } from '../definitions/order.tools.js';
import { transferToHumanTool } from '../definitions/handoff.tool.js';
import type { ToolExecutionContext } from '../types/tool.interface.js';

describe('Business Logic Tools', () => {
  const context: ToolExecutionContext = {
    businessId: 'bus-rest-01',
    conversationId: 'conv-999',
  };

  it('calculate_order should accurately calculate subtotals, tax and totals', async () => {
    const args = {
      items: [
        { product_name: 'Hamburguesa Doble', quantity: 2, unit_price: 35000 },
        { product_name: 'Papas Rústicas', quantity: 1, unit_price: 10000 },
      ],
      delivery_fee: 5000,
      tax_rate: 0.19,
    };

    const result = await calculateOrderTool.execute(args, context);

    expect(result.subtotal).toBe(80000); // 70000 + 10000
    expect(result.tax).toBe(15200); // 80000 * 0.19
    expect(result.delivery_fee).toBe(5000);
    expect(result.total).toBe(100200); // 80000 + 15200 + 5000
  });

  it('create_order should return confirmed order details with tracking ID', async () => {
    const args = {
      items: [
        { product_name: 'Hamburguesa Clásica', quantity: 1, unit_price: 24900 },
      ],
      delivery_address: 'Calle 100 # 15-20 Apto 301',
      contact_phone: '+573101234567',
      payment_method: 'enlace_de_pago' as const,
      notes: 'Timbrar al apto 301',
    };

    const result = await createOrderTool.execute(args, context);

    expect(result.success).toBe(true);
    expect(result.status).toBe('pending');
    expect(result.order_id).toBeDefined();
    expect(result.business_id).toBe('bus-rest-01');
    expect(result.summary.total).toBe(24900);
  });

  it('transfer_to_human should flag conversation for human intervention', async () => {
    const args = {
      reason: 'El cliente solicita hablar con el encargado de cocina.',
      urgency: 'high' as const,
      summary_for_agent: 'Cliente inconforme con demora de entrega.',
    };

    const result = await transferToHumanTool.execute(args, context);

    expect(result.transferred).toBe(true);
    expect(result.status).toBe('waiting_for_human');
    expect(result.urgency).toBe('high');
    expect(result.conversation_id).toBe('conv-999');
  });
});
