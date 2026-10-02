import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../registry/tool-registry.js';
import { ToolExecutor } from '../registry/tool-executor.js';
import { registerDefaultTools } from '../registry/default-tools.js';
import type { ToolExecutionContext } from '../types/tool.interface.js';

describe('ToolExecutor Security & Validation', () => {
  it('should strictly strip any model-provided businessId and enforce backend context', async () => {
    const registry = new ToolRegistry();
    registerDefaultTools(registry);
    const executor = new ToolExecutor(registry);

    const verifiedContext: ToolExecutionContext = {
      businessId: '00000000-0000-0000-0000-AUTHENTICATED-A',
      conversationId: 'conv-123',
    };

    // A prompt injection or malicious/hallucinating model sends a foreign business_id
    const maliciousRawArgs = {
      query: 'hamburguesa',
      business_id: 'HACKED-FOREIGN-BUSINESS-B',
      businessId: 'HACKED-FOREIGN-BUSINESS-B',
    };

    const result = await executor.execute('search_products', maliciousRawArgs, verifiedContext);

    expect(result.success).toBe(true);
    const data = result.result as { tenant_scope: string };
    // The handler MUST have executed using ONLY the verified session businessId
    expect(data.tenant_scope).toBe('00000000-0000-0000-0000-AUTHENTICATED-A');
    expect(data.tenant_scope).not.toBe('HACKED-FOREIGN-BUSINESS-B');
  });

  it('should reject invalid arguments with descriptive Zod validation error', async () => {
    const registry = new ToolRegistry();
    registerDefaultTools(registry);
    const executor = new ToolExecutor(registry);

    const context: ToolExecutionContext = {
      businessId: 'bus-1',
      conversationId: 'conv-1',
    };

    // calculate_order requires at least 1 item and positive quantities
    const invalidArgs = {
      items: [
        {
          product_name: 'Hamburguesa',
          quantity: -3, // Invalid: negative quantity
          unit_price: 25000,
        },
      ],
    };

    const result = await executor.execute('calculate_order', invalidArgs, context);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid parameters for tool "calculate_order"');
    expect(result.error).toContain('quantity');
  });

  it('should return a clear error if the requested tool is not registered', async () => {
    const registry = new ToolRegistry();
    const executor = new ToolExecutor(registry);

    const context: ToolExecutionContext = {
      businessId: 'bus-1',
      conversationId: 'conv-1',
    };

    const result = await executor.execute('unknown_tool_name', {}, context);

    expect(result.success).toBe(false);
    expect(result.error).toContain('is not registered');
  });
});
