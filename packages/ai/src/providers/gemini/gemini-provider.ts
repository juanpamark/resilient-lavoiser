/**
 * Gemini AI Provider implementation using official @google/genai SDK
 */

import { GoogleGenAI } from '@google/genai';
import type {
  AIProvider,
  GenerateRequest,
  GenerateResponse,
  FinishReason,
} from '../ai-provider.interface.js';
import { GeminiTurnAdapter } from './gemini-turn-adapter.js';

export interface GeminiProviderOptions {
  apiKey?: string;
  defaultModel?: string;
}

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private client: GoogleGenAI;
  private defaultModel: string;

  constructor(options: GeminiProviderOptions = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY || '';
    this.client = new GoogleGenAI({ apiKey });
    this.defaultModel = options.defaultModel || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    let model = request.model || this.defaultModel;
    if (model === 'gemini-2.5-flash' || model === 'models/gemini-2.5-flash') {
      model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    }

    // 1. Adapt canonical messages into Gemini turn structure
    const adapted = GeminiTurnAdapter.adapt(request.messages, request.systemInstruction);

    // 2. Prepare function declarations if tools are provided
    const functionDeclarations = request.tools?.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    // 3. Assemble request config
    const config: Record<string, unknown> = {
      temperature: request.config?.temperature ?? 0.7,
      maxOutputTokens: request.config?.maxOutputTokens ?? 2048,
    };

    if (request.config?.topP !== undefined) {
      config.topP = request.config.topP;
    }

    if (adapted.systemInstruction) {
      config.systemInstruction = adapted.systemInstruction;
    }

    if (functionDeclarations && functionDeclarations.length > 0) {
      config.tools = [{ functionDeclarations }];
    }

    // 4. Invoke Gemini API
    const response = await this.client.models.generateContent({
      model,
      contents: adapted.contents,
      config,
    });

    // 5. Parse response candidate and finish reason
    const candidate = response.candidates?.[0];
    const parsed = candidate
      ? GeminiTurnAdapter.parseGeminiCandidate(candidate)
      : { text: null, toolCalls: [] };

    // 6. Map finish reason to canonical representation
    let finishReason: FinishReason = 'STOP';
    const rawReason = candidate?.finishReason;
    if (parsed.toolCalls.length > 0) {
      finishReason = 'TOOL_CALLS';
    } else if (rawReason === 'MAX_TOKENS') {
      finishReason = 'MAX_TOKENS';
    } else if (rawReason === 'SAFETY') {
      finishReason = 'SAFETY';
    }

    // 7. Extract token usage metadata
    const usageMetadata = response.usageMetadata;
    const inputTokens = usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = usageMetadata?.candidatesTokenCount ?? 0;

    return {
      text: parsed.text,
      toolCalls: parsed.toolCalls.length > 0 ? parsed.toolCalls : undefined,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      modelUsed: model,
      finishReason,
    };
  }
}
