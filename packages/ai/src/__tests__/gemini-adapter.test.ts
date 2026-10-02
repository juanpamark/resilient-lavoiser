import { describe, it, expect } from 'vitest';
import { GeminiTurnAdapter } from '../providers/gemini/gemini-turn-adapter.js';
import type { CanonicalMessage } from '../providers/ai-provider.interface.js';

describe('GeminiTurnAdapter', () => {
  it('should extract system messages into systemInstruction and alternate user/model turns', () => {
    const canonicalMessages: CanonicalMessage[] = [
      {
        role: 'system',
        parts: [{ type: 'text', text: 'Eres un asistente amable.' }],
      },
      {
        role: 'user',
        parts: [{ type: 'text', text: 'Hola' }],
      },
      {
        role: 'assistant',
        parts: [{ type: 'text', text: '¡Hola! ¿En qué puedo ayudarte?' }],
      },
    ];

    const result = GeminiTurnAdapter.adapt(canonicalMessages);

    expect(result.systemInstruction).toBe('Eres un asistente amable.');
    expect(result.contents).toHaveLength(2);
    expect(result.contents[0]?.role).toBe('user');
    expect(result.contents[0]?.parts[0]?.text).toBe('Hola');
    expect(result.contents[1]?.role).toBe('model');
    expect(result.contents[1]?.parts[0]?.text).toBe('¡Hola! ¿En qué puedo ayudarte?');
  });

  it('should convert tool_result into user turn with functionResponse', () => {
    const canonicalMessages: CanonicalMessage[] = [
      {
        role: 'user',
        parts: [{ type: 'text', text: '¿Qué hamburguesas tienen?' }],
      },
      {
        role: 'assistant',
        parts: [
          {
            type: 'function_call',
            name: 'search_products',
            args: { category: 'Hamburguesas' },
          },
        ],
      },
      {
        role: 'tool_result',
        parts: [
          {
            type: 'function_response',
            name: 'search_products',
            response: { products: [{ name: 'Hamburguesa Clásica', price: 25000 }] },
          },
        ],
      },
    ];

    const result = GeminiTurnAdapter.adapt(canonicalMessages);

    expect(result.contents).toHaveLength(3);
    // User question
    expect(result.contents[0]?.role).toBe('user');
    // Model function call
    expect(result.contents[1]?.role).toBe('model');
    expect(result.contents[1]?.parts[0]?.functionCall?.name).toBe('search_products');
    // Function response delivered as user turn
    expect(result.contents[2]?.role).toBe('user');
    expect(result.contents[2]?.parts[0]?.functionResponse?.name).toBe('search_products');
    expect(result.contents[2]?.parts[0]?.functionResponse?.response).toEqual({
      products: [{ name: 'Hamburguesa Clásica', price: 25000 }],
    });
  });

  it('should collapse multiple tool results into a single user turn', () => {
    const canonicalMessages: CanonicalMessage[] = [
      {
        role: 'tool_result',
        parts: [
          {
            type: 'function_response',
            name: 'tool_a',
            response: { result: 'A' },
          },
        ],
      },
      {
        role: 'tool_result',
        parts: [
          {
            type: 'function_response',
            name: 'tool_b',
            response: { result: 'B' },
          },
        ],
      },
    ];

    const result = GeminiTurnAdapter.adapt(canonicalMessages);

    // Both tool results must be collapsed into 1 user turn with 2 functionResponse parts
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0]?.role).toBe('user');
    expect(result.contents[0]?.parts).toHaveLength(2);
    expect(result.contents[0]?.parts[0]?.functionResponse?.name).toBe('tool_a');
    expect(result.contents[0]?.parts[1]?.functionResponse?.name).toBe('tool_b');
  });
});
