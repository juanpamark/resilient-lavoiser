/**
 * Model Selector
 *
 * Resolves the provider and model to invoke based on agent settings and task complexity.
 */

import type { ModelConfig } from '@platform/core';

export type TaskComplexity = 'fast' | 'standard' | 'complex';

export class ModelSelector {
  static resolve(config?: Partial<ModelConfig>, complexity: TaskComplexity = 'standard'): {
    provider: string;
    model: string;
  } {
    const provider = config?.provider || 'gemini';

    if (provider === 'gemini') {
      if (complexity === 'fast') {
        return { provider: 'gemini', model: 'gemini-flash-latest' };
      }
      if (complexity === 'complex') {
        return { provider: 'gemini', model: 'gemini-pro-latest' };
      }
      return {
        provider: 'gemini',
        model:
          config?.model && config.model !== 'gemini-2.5-flash' && config.model !== 'gemini-2.0-flash'
            ? config.model
            : process.env.GEMINI_MODEL || 'gemini-flash-latest',
      };
    }

    return {
      provider,
      model: config?.model || process.env.GEMINI_MODEL || 'gemini-flash-latest',
    };
  }
}
