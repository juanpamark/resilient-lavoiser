/**
 * AI Orchestrator
 *
 * Coordinates context resolution, prompt building, provider invocation,
 * and the controlled execution loop for function calling / tools.
 */

import type { Business, AgentConfig, Customer, Message } from '@platform/core';
import type {
  AIProvider,
  CanonicalMessage,
  TokenUsage,
  ToolDeclaration,
} from '../providers/ai-provider.interface.js';
import { AIProviderFactory } from '../providers/provider-factory.js';
import { PromptBuilder } from './prompt-builder.js';
import { ContextManager } from './context-manager.js';
import { ModelSelector } from './model-selector.js';

import type { ToolExecutor } from '@platform/tools';

export interface ToolExecutorCallback {
  (
    name: string,
    args: Record<string, unknown>,
    context: { businessId: string; conversationId: string }
  ): Promise<Record<string, unknown>>;
}

export interface OrchestrateOptions {
  business: Business;
  agentConfig: AgentConfig;
  agentName: string;
  customer?: Customer;
  conversationId: string;
  history: Message[];
  incomingUserText: string;
  availableTools?: ToolDeclaration[];
  toolExecutor?: ToolExecutor | ToolExecutorCallback;
  maxToolIterations?: number;
}

export interface ToolCallAudit {
  name: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
  durationMs: number;
}

export interface OrchestratorResult {
  text: string;
  toolCallsExecuted: ToolCallAudit[];
  usage: TokenUsage;
  modelUsed: string;
  latencyMs: number;
}

export class AIOrchestrator {
  private providerFactory: AIProviderFactory;
  private contextManager: ContextManager;

  constructor(factory?: AIProviderFactory) {
    this.providerFactory = factory || AIProviderFactory.getInstance();
    this.contextManager = new ContextManager({ maxHistoryMessages: 20 });
  }

  async processMessage(options: OrchestrateOptions): Promise<OrchestratorResult> {
    const startTime = Date.now();
    const maxIterations = options.maxToolIterations ?? 5;
    const toolCallsExecuted: ToolCallAudit[] = [];

    const totalUsage: TokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };

    // 1. Build modular system instruction
    const systemInstruction = PromptBuilder.build({
      agentName: options.agentName,
      config: options.agentConfig,
      business: options.business,
      customer: options.customer,
    });

    // 2. Format past conversation history
    const conversationMessages: CanonicalMessage[] = this.contextManager.formatHistory(
      options.history
    );

    // 3. Append the new incoming user message
    conversationMessages.push({
      role: 'user',
      parts: [{ type: 'text', text: options.incomingUserText }],
    });

    // 4. Resolve provider and model
    const { provider: providerName, model } = ModelSelector.resolve(
      options.agentConfig.model_config
    );
    const provider: AIProvider = this.providerFactory.get(providerName);

    let iterations = 0;
    let finalText = '';

    // 5. Function Calling Loop
    while (iterations < maxIterations) {
      iterations++;

      const response = await provider.generate({
        model,
        systemInstruction,
        messages: conversationMessages,
        tools: options.availableTools,
        config: {
          temperature: options.agentConfig.model_config?.temperature ?? 0.7,
          maxOutputTokens: options.agentConfig.model_config?.maxOutputTokens ?? 2048,
        },
      });

      // Accumulate usage
      totalUsage.inputTokens += response.usage.inputTokens;
      totalUsage.outputTokens += response.usage.outputTokens;
      totalUsage.totalTokens += response.usage.totalTokens;

      // Check if model issued tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Record assistant turn with function calls
        conversationMessages.push({
          role: 'assistant',
          parts: response.toolCalls,
        });

        // Execute tools
        const functionResponses: Array<{
          type: 'function_response';
          name: string;
          response: Record<string, unknown>;
        }> = [];

        for (const tc of response.toolCalls) {
          const toolStart = Date.now();
          let result: Record<string, unknown> = {};

          if (options.toolExecutor) {
            try {
              if (typeof options.toolExecutor === 'function') {
                result = await options.toolExecutor(tc.name, tc.args, {
                  businessId: options.business.id,
                  conversationId: options.conversationId,
                });
              } else if ('execute' in options.toolExecutor) {
                const execResult = await options.toolExecutor.execute(tc.name, tc.args, {
                  businessId: options.business.id,
                  conversationId: options.conversationId,
                  customerId: options.customer?.id,
                });
                result = execResult.success
                  ? (execResult.result as Record<string, unknown>)
                  : { error: execResult.error };
              }
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : 'Unknown tool error';
              result = { error: errorMsg };
            }
          } else {
            result = { error: `Tool executor not configured for tool "${tc.name}"` };
          }

          const toolDuration = Date.now() - toolStart;
          toolCallsExecuted.push({
            name: tc.name,
            args: tc.args,
            result,
            durationMs: toolDuration,
          });

          functionResponses.push({
            type: 'function_response',
            name: tc.name,
            response: result,
          });
        }

        // Deliver tool results in the next turn
        conversationMessages.push({
          role: 'tool_result',
          parts: functionResponses,
        });

        // Continue loop to allow model to consume tool result
        continue;
      }

      // No tool calls: final answer generated
      finalText = response.text || '';
      break;
    }

    if (!finalText && iterations >= maxIterations) {
      finalText =
        'He procesado tu solicitud, pero se superó el límite de pasos operativos. En breve un asesor humano continuará tu atención si es necesario.';
    }

    return {
      text: finalText,
      toolCallsExecuted,
      usage: totalUsage,
      modelUsed: model,
      latencyMs: Date.now() - startTime,
    };
  }
}
