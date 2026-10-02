/**
 * Gemini Turn Adapter
 *
 * Normalizes canonical messages into Google Gemini's strict turn format:
 * 1. Extracts system messages into config.systemInstruction.
 * 2. Maps canonical roles ('user' -> 'user', 'assistant' -> 'model').
 * 3. Maps tool results into 'user' turns with 'functionResponse' parts.
 * 4. Collapses consecutive tool results into a single turn to satisfy parallel execution requirements.
 * 5. Merges consecutive turns of the same role to strictly enforce alternating 'user' / 'model' sequencing.
 */

import type {
  CanonicalMessage,
  FunctionCallPart,
} from '../ai-provider.interface.js';

export interface GeminiPart {
  text?: string;
  functionCall?: {
    name?: string;
    args?: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, unknown>;
  };
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiAdapterOutput {
  systemInstruction?: string;
  contents: GeminiContent[];
}

export class GeminiTurnAdapter {
  static adapt(
    messages: CanonicalMessage[],
    systemInstructionOverride?: string
  ): GeminiAdapterOutput {
    let systemInstruction = systemInstructionOverride || '';
    const intermediateContents: GeminiContent[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Concatenate any system message content into systemInstruction
        const systemText = msg.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text)
          .join('\n');
        systemInstruction = systemInstruction
          ? `${systemInstruction}\n\n${systemText}`
          : systemText;
        continue;
      }

      if (msg.role === 'assistant') {
        const parts: GeminiPart[] = [];
        for (const p of msg.parts) {
          if (p.type === 'text') {
            parts.push({ text: p.text });
          } else if (p.type === 'function_call') {
            parts.push({
              functionCall: {
                name: p.name,
                args: p.args,
              },
            });
          }
        }
        if (parts.length > 0) {
          intermediateContents.push({ role: 'model', parts });
        }
        continue;
      }

      if (msg.role === 'tool_result') {
        // Tool results in Gemini are delivered as a 'user' turn with functionResponse
        const parts: GeminiPart[] = [];
        for (const p of msg.parts) {
          if (p.type === 'function_response') {
            parts.push({
              functionResponse: {
                name: p.name,
                response: p.response,
              },
            });
          }
        }
        if (parts.length > 0) {
          intermediateContents.push({ role: 'user', parts });
        }
        continue;
      }

      if (msg.role === 'user') {
        const parts: GeminiPart[] = [];
        for (const p of msg.parts) {
          if (p.type === 'text') {
            parts.push({ text: p.text });
          }
        }
        if (parts.length > 0) {
          intermediateContents.push({ role: 'user', parts });
        }
        continue;
      }
    }

    // Collapse consecutive turns of the same role to enforce alternating 'user' / 'model'
    const normalizedContents: GeminiContent[] = [];
    for (const turn of intermediateContents) {
      const prev = normalizedContents[normalizedContents.length - 1];
      if (prev && prev.role === turn.role) {
        prev.parts.push(...turn.parts);
      } else {
        normalizedContents.push({
          role: turn.role,
          parts: [...turn.parts],
        });
      }
    }

    return {
      systemInstruction: systemInstruction.trim() || undefined,
      contents: normalizedContents,
    };
  }

  static parseGeminiCandidate(candidate: {
    content?: { parts?: Array<{ text?: string; functionCall?: { name?: string; args?: Record<string, unknown> } }> };
    finishReason?: string;
  }): {
    text: string | null;
    toolCalls: FunctionCallPart[];
  } {
    const parts = candidate.content?.parts || [];
    let text: string | null = null;
    const toolCalls: FunctionCallPart[] = [];

    for (const part of parts) {
      if (part.text) {
        text = text ? `${text}\n${part.text}` : part.text;
      }
      if (part.functionCall && part.functionCall.name) {
        toolCalls.push({
          type: 'function_call',
          name: part.functionCall.name,
          args: (part.functionCall.args as Record<string, unknown>) || {},
        });
      }
    }

    return { text, toolCalls };
  }
}
