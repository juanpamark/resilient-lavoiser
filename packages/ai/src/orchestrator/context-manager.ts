/**
 * Conversation Context Manager
 *
 * Formats message history into CanonicalMessages, managing context window size
 * and preserving multi-turn conversational coherence.
 */

import type { Message } from '@platform/core';
import type { CanonicalMessage, CanonicalPart } from '../providers/ai-provider.interface.js';

export interface ContextManagerOptions {
  maxHistoryMessages?: number;
}

export class ContextManager {
  private maxHistoryMessages: number;

  constructor(options: ContextManagerOptions = {}) {
    this.maxHistoryMessages = options.maxHistoryMessages || 20;
  }

  formatHistory(messages: Message[]): CanonicalMessage[] {
    // 1. Take only the most recent N messages to keep prompt size predictable
    const recentMessages = messages.slice(-this.maxHistoryMessages);
    const canonicalMessages: CanonicalMessage[] = [];

    for (const msg of recentMessages) {
      const parts: CanonicalPart[] = [];

      // User turn
      if (msg.role === 'user') {
        parts.push({ type: 'text', text: msg.content });
        canonicalMessages.push({ role: 'user', parts });
        continue;
      }

      // Assistant or human_agent turn
      if (msg.role === 'assistant' || msg.role === 'human_agent') {
        if (msg.content) {
          parts.push({ type: 'text', text: msg.content });
        }
        // If the assistant message had tool calls
        if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
          for (const tc of msg.tool_calls) {
            parts.push({
              type: 'function_call',
              id: tc.id,
              name: tc.name,
              args: tc.arguments || {},
            });
          }
        }
        if (parts.length > 0) {
          canonicalMessages.push({ role: 'assistant', parts });
        }
        continue;
      }

      // Tool results turn
      if (msg.role === 'tool') {
        if (msg.tool_results && Array.isArray(msg.tool_results)) {
          for (const tr of msg.tool_results) {
            parts.push({
              type: 'function_response',
              callId: tr.tool_call_id,
              name: tr.name,
              response: tr.result ? (tr.result as Record<string, unknown>) : { error: tr.error },
            });
          }
        } else if (msg.content) {
          parts.push({
            type: 'function_response',
            name: 'tool_output',
            response: { output: msg.content },
          });
        }
        if (parts.length > 0) {
          canonicalMessages.push({ role: 'tool_result', parts });
        }
        continue;
      }

      // System turn
      if (msg.role === 'system') {
        parts.push({ type: 'text', text: msg.content });
        canonicalMessages.push({ role: 'system', parts });
        continue;
      }
    }

    return canonicalMessages;
  }
}
