import { describe, it, expect, vi } from 'vitest';
import { AIOrchestrator, type ToolExecutorCallback } from '../orchestrator/ai-orchestrator.js';
import { AIProviderFactory } from '../providers/provider-factory.js';
import type {
  AIProvider,
  GenerateRequest,
  GenerateResponse,
} from '../providers/ai-provider.interface.js';
import type { Business, AgentConfig } from '@platform/core';

describe('AIOrchestrator', () => {
  it('should run a complete multi-turn function calling loop and return final answer', async () => {
    // 1. Create a Mock Provider that issues a tool call on Turn 1, and final text on Turn 2
    let turn = 0;
    const mockProvider: AIProvider = {
      name: 'gemini',
      generate: vi.fn(async (req: GenerateRequest): Promise<GenerateResponse> => {
        turn++;
        if (turn === 1) {
          // Model decides to call search_products
          return {
            text: null,
            toolCalls: [
              {
                type: 'function_call',
                name: 'search_products',
                args: { query: 'hamburguesa' },
              },
            ],
            usage: { inputTokens: 50, outputTokens: 20, totalTokens: 70 },
            modelUsed: req.model,
            finishReason: 'TOOL_CALLS',
          };
        } else {
          // Model consumes tool result and answers customer
          return {
            text: 'Tenemos disponible la Hamburguesa Clásica por $24.900.',
            toolCalls: undefined,
            usage: { inputTokens: 80, outputTokens: 30, totalTokens: 110 },
            modelUsed: req.model,
            finishReason: 'STOP',
          };
        }
      }),
    };

    // 2. Set up Provider Factory with mock
    const factory = AIProviderFactory.getInstance();
    factory.register('gemini', mockProvider);

    const orchestrator = new AIOrchestrator(factory);

    const business: Business = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Restaurante Test',
      description: 'Hamburguesería',
      status: 'active',
      timezone: 'America/Bogota',
      business_hours: null,
      location: null,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const agentConfig: AgentConfig = {
      id: 'cfg-1',
      agent_id: 'ag-1',
      version: 1,
      system_instructions: 'Atiende amablemente a los clientes.',
      personality: { tone: 'amable', language: 'es-CO' },
      business_context: { overview: '', faq: [] },
      policies: {},
      enabled_tools: ['search_products'],
      model_config: { provider: 'gemini', model: 'gemini-2.0-flash' },
      out_of_hours_behavior: 'bot_responds',
      human_handoff_trigger: 'humano',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // 3. Mock Tool Executor
    const mockToolExecutor: ToolExecutorCallback = vi.fn(async (name, args) => {
      expect(name).toBe('search_products');
      expect(args).toEqual({ query: 'hamburguesa' });
      return {
        products: [{ name: 'Hamburguesa Clásica', price: 24900 }],
      };
    });

    // 4. Run Orchestrator
    const result = await orchestrator.processMessage({
      business,
      agentConfig,
      agentName: 'ChefBot',
      conversationId: 'conv-test-1',
      history: [],
      incomingUserText: 'Hola, ¿tienen hamburguesas?',
      toolExecutor: mockToolExecutor,
    });

    // 5. Verify results
    expect(result.text).toBe('Tenemos disponible la Hamburguesa Clásica por $24.900.');
    expect(result.toolCallsExecuted).toHaveLength(1);
    expect(result.toolCallsExecuted[0]?.name).toBe('search_products');
    expect(result.toolCallsExecuted[0]?.result).toEqual({
      products: [{ name: 'Hamburguesa Clásica', price: 24900 }],
    });
    expect(mockToolExecutor).toHaveBeenCalledTimes(1);
    expect(result.usage.totalTokens).toBe(180); // 70 + 110
  });

  it('should prevent infinite loops when a runaway model continuously requests tools', async () => {
    // Model continuously requests tools indefinitely
    const mockLoopingProvider: AIProvider = {
      name: 'gemini',
      generate: vi.fn(async (req: GenerateRequest): Promise<GenerateResponse> => {
        return {
          text: null,
          toolCalls: [
            {
              type: 'function_call',
              name: 'infinite_tool',
              args: {},
            },
          ],
          usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
          modelUsed: req.model,
          finishReason: 'TOOL_CALLS',
        };
      }),
    };

    const factory = AIProviderFactory.getInstance();
    factory.register('gemini', mockLoopingProvider);

    const orchestrator = new AIOrchestrator(factory);

    const business: Business = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test Business',
      description: null,
      status: 'active',
      timezone: 'America/Bogota',
      business_hours: null,
      location: null,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const agentConfig: AgentConfig = {
      id: 'cfg-loop',
      agent_id: 'ag-loop',
      version: 1,
      system_instructions: 'Loop agent',
      personality: { tone: 'neutral', language: 'es' },
      business_context: { overview: '', faq: [] },
      policies: {},
      enabled_tools: ['infinite_tool'],
      model_config: { provider: 'gemini', model: 'gemini-2.0-flash' },
      out_of_hours_behavior: 'bot_responds',
      human_handoff_trigger: 'humano',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const mockToolExecutor: ToolExecutorCallback = vi.fn(async () => ({ ok: true }));

    // Run with maxToolIterations = 3
    const result = await orchestrator.processMessage({
      business,
      agentConfig,
      agentName: 'LoopBot',
      conversationId: 'conv-loop',
      history: [],
      incomingUserText: 'Run loop',
      toolExecutor: mockToolExecutor,
      maxToolIterations: 3,
    });

    expect(result.toolCallsExecuted).toHaveLength(3);
    expect(mockToolExecutor).toHaveBeenCalledTimes(3);
    expect(result.text).toContain('se superó el límite de pasos operativos');
  });
});
