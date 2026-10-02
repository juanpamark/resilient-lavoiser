/**
 * AI Provider Factory
 */

import type { AIProvider } from './ai-provider.interface.js';
import { GeminiProvider } from './gemini/gemini-provider.js';

export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<string, AIProvider> = new Map();

  private constructor() {
    // Register default Gemini provider with key from env or dev fallback
    const key = process.env.GEMINI_API_KEY || 'dummy_api_key_for_local_testing';
    this.register('gemini', new GeminiProvider({ apiKey: key }));
  }

  static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  register(name: string, provider: AIProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  get(name: string): AIProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`AI Provider "${name}" is not registered. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return provider;
  }

  has(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }
}
