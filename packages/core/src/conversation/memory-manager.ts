import type { Message, Conversation, Customer } from '../types/index.js';

export interface MemoryManagerConfig {
  maxHistoryMessages?: number;
  maxEstimatedTokens?: number;
}

export interface ConversationMemoryContext {
  history: Message[];
  sessionState: Record<string, unknown>;
  customerProfile: Record<string, unknown>;
}

export class MemoryManager {
  private maxHistoryMessages: number;
  private maxEstimatedTokens: number;

  constructor(config: MemoryManagerConfig = {}) {
    this.maxHistoryMessages = config.maxHistoryMessages || 20;
    this.maxEstimatedTokens = config.maxEstimatedTokens || 4000;
  }

  /**
   * Layer 1: Immediate Message History Compaction
   * Prunes older messages while preserving chronological flow within token budget
   */
  compactHistory(messages: Message[]): Message[] {
    if (!messages || messages.length === 0) return [];

    // Sort chronologically ascending
    const sorted = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Keep only the most recent N messages
    let sliced = sorted.slice(-this.maxHistoryMessages);

    // Check approximate token threshold (rough estimate: ~4 chars per token)
    let totalChars = sliced.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    while (totalChars > this.maxEstimatedTokens * 4 && sliced.length > 2) {
      const removed = sliced.shift();
      if (removed) {
        totalChars -= removed.content?.length || 0;
      }
    }

    return sliced;
  }

  /**
   * Layer 2: Active Session Memory
   * Manages ephemeral order drafts, current active intent, and step-by-step state
   */
  updateSessionState(
    conversation: Conversation,
    updates: Record<string, unknown>
  ): Record<string, unknown> {
    const currentMetadata = conversation.metadata || {};
    return {
      ...currentMetadata,
      ...updates,
      last_session_update_at: new Date().toISOString(),
    };
  }

  /**
   * Layer 3: Long-term Customer Profile Memory
   * Accumulates facts across visits (allergies, favorite dishes, delivery addresses)
   */
  updateCustomerProfile(
    customer: Customer,
    newAttributes: Record<string, unknown>
  ): Record<string, unknown> {
    const currentProfile = customer.profile || {};
    return {
      ...currentProfile,
      ...newAttributes,
      last_profile_sync_at: new Date().toISOString(),
    };
  }

  /**
   * Assembles all 3 layers for the AI Orchestrator
   */
  assembleContext(
    conversation: Conversation,
    customer: Customer,
    messages: Message[]
  ): ConversationMemoryContext {
    return {
      history: this.compactHistory(messages),
      sessionState: conversation.metadata || {},
      customerProfile: customer.profile || {},
    };
  }
}
