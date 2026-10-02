import type {
  Conversation,
  Message,
  MessageRole,
  ContentType,
  ToolCallItem,
  ToolResultItem,
} from '../types/conversation.js';
import {
  ConversationStateMachine,
  type ConversationEvent,
  type StateTransitionResult,
} from './conversation-state-machine.js';

export interface NewMessageInput {
  business_id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  content_type?: ContentType;
  external_message_id?: string | null;
  tool_calls?: ToolCallItem[] | null;
  tool_results?: ToolResultItem[] | null;
  channel_metadata?: Record<string, unknown> | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  model_used?: string | null;
}

export interface ConversationRepository {
  findConversationById(id: string): Promise<Conversation | null>;
  findActiveConversation(
    businessId: string,
    customerId: string,
    channelType: string
  ): Promise<Conversation | null>;
  createConversation(
    data: Omit<Conversation, 'id' | 'created_at' | 'started_at' | 'last_message_at'>
  ): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  findMessageByExternalId(
    businessId: string,
    externalMessageId: string
  ): Promise<Message | null>;
  createMessage(data: Omit<Message, 'id' | 'created_at'>): Promise<Message>;
  listRecentMessages(conversationId: string, limit?: number): Promise<Message[]>;
}

/**
 * In-memory repository for unit testing and offline execution
 */
export class InMemoryConversationRepository implements ConversationRepository {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();

  async findConversationById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async findActiveConversation(
    businessId: string,
    customerId: string,
    channelType: string
  ): Promise<Conversation | null> {
    for (const conv of this.conversations.values()) {
      if (
        conv.business_id === businessId &&
        conv.customer_id === customerId &&
        conv.channel_type === channelType &&
        conv.status !== 'closed'
      ) {
        return conv;
      }
    }
    return null;
  }

  async createConversation(
    data: Omit<Conversation, 'id' | 'created_at' | 'started_at' | 'last_message_at'>
  ): Promise<Conversation> {
    const now = new Date().toISOString();
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const conversation: Conversation = {
      ...data,
      id,
      started_at: now,
      last_message_at: now,
      created_at: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(
    id: string,
    updates: Partial<Conversation>
  ): Promise<Conversation> {
    const existing = this.conversations.get(id);
    if (!existing) {
      throw new Error(`Conversation not found: ${id}`);
    }
    const updated = { ...existing, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  async findMessageByExternalId(
    businessId: string,
    externalMessageId: string
  ): Promise<Message | null> {
    for (const msg of this.messages.values()) {
      if (
        msg.business_id === businessId &&
        msg.external_message_id === externalMessageId
      ) {
        return msg;
      }
    }
    return null;
  }

  async createMessage(data: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const now = new Date().toISOString();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const message: Message = {
      ...data,
      id,
      created_at: now,
    };
    this.messages.set(id, message);
    return message;
  }

  async listRecentMessages(conversationId: string, limit = 20): Promise<Message[]> {
    const result: Message[] = [];
    for (const msg of this.messages.values()) {
      if (msg.conversation_id === conversationId) {
        result.push(msg);
      }
    }
    result.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return result.slice(-limit);
  }
}

export class ConversationService {
  constructor(private repo: ConversationRepository) {}

  /**
   * Resolves an existing active conversation or creates a new one
   */
  async getOrCreateConversation(
    businessId: string,
    customerId: string,
    agentId: string,
    channelType: string
  ): Promise<Conversation> {
    const active = await this.repo.findActiveConversation(
      businessId,
      customerId,
      channelType
    );
    if (active) {
      return active;
    }

    return this.repo.createConversation({
      business_id: businessId,
      agent_id: agentId,
      customer_id: customerId,
      channel_type: channelType,
      status: 'active',
      assigned_to: null,
      metadata: {},
      closed_at: null,
    });
  }

  /**
   * Appends an incoming user message with idempotency check against external_message_id
   */
  async processIncomingMessage(input: {
    businessId: string;
    conversationId: string;
    externalMessageId?: string;
    content: string;
    contentType?: ContentType;
    channelMetadata?: Record<string, unknown>;
  }): Promise<{
    message: Message;
    isDuplicate: boolean;
    canAIGenerate: boolean;
    conversation: Conversation;
  }> {
    // 1. Check idempotency if external_message_id is provided
    if (input.externalMessageId) {
      const existing = await this.repo.findMessageByExternalId(
        input.businessId,
        input.externalMessageId
      );
      if (existing) {
        const conversation = await this.repo.findConversationById(input.conversationId);
        return {
          message: existing,
          isDuplicate: true,
          canAIGenerate: false,
          conversation: conversation!,
        };
      }
    }

    // 2. Load conversation
    const conversation = await this.repo.findConversationById(input.conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${input.conversationId}`);
    }

    // 3. Handle state machine transition on incoming message
    const transition = ConversationStateMachine.transition(conversation.status, {
      type: 'MESSAGE_RECEIVED',
      sender: 'user',
    });

    let updatedConv = conversation;
    if (transition.valid && transition.nextState !== conversation.status) {
      updatedConv = await this.repo.updateConversation(conversation.id, {
        status: transition.nextState,
        last_message_at: new Date().toISOString(),
        ...(transition.nextState === 'active' ? { closed_at: null } : {}),
      });
    } else {
      updatedConv = await this.repo.updateConversation(conversation.id, {
        last_message_at: new Date().toISOString(),
      });
    }

    // 4. Save user message
    const message = await this.repo.createMessage({
      conversation_id: updatedConv.id,
      business_id: input.businessId,
      role: 'user',
      content_type: input.contentType || 'text',
      content: input.content,
      external_message_id: input.externalMessageId || null,
      tool_calls: null,
      tool_results: null,
      channel_metadata: input.channelMetadata || null,
      input_tokens: null,
      output_tokens: null,
      model_used: null,
    });

    // 5. Evaluate if AI can generate response
    const canAI = ConversationStateMachine.canAIGenerate(updatedConv.status);

    return {
      message,
      isDuplicate: false,
      canAIGenerate: canAI,
      conversation: updatedConv,
    };
  }

  /**
   * Appends an assistant response, enforcing strict muting guard if human is active
   */
  async processAssistantResponse(input: {
    businessId: string;
    conversationId: string;
    content: string;
    toolCalls?: ToolCallItem[];
    toolResults?: ToolResultItem[];
    inputTokens?: number;
    outputTokens?: number;
    modelUsed?: string;
  }): Promise<{ message: Message | null; muted: boolean }> {
    const conversation = await this.repo.findConversationById(input.conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${input.conversationId}`);
    }

    // Guard: strictly mute AI if not in 'active' status
    if (!ConversationStateMachine.canAIGenerate(conversation.status)) {
      return {
        message: null,
        muted: true,
      };
    }

    const message = await this.repo.createMessage({
      conversation_id: conversation.id,
      business_id: input.businessId,
      role: 'assistant',
      content_type: 'text',
      content: input.content,
      external_message_id: null,
      tool_calls: input.toolCalls || null,
      tool_results: input.toolResults || null,
      channel_metadata: null,
      input_tokens: input.inputTokens || null,
      output_tokens: input.outputTokens || null,
      model_used: input.modelUsed || null,
    });

    await this.repo.updateConversation(conversation.id, {
      last_message_at: new Date().toISOString(),
    });

    return {
      message,
      muted: false,
    };
  }

  /**
   * Applies an explicit state transition (handoff, operator assignment, release to bot, close)
   */
  async transitionState(
    conversationId: string,
    event: ConversationEvent
  ): Promise<{ conversation: Conversation; transition: StateTransitionResult }> {
    const conversation = await this.repo.findConversationById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const transition = ConversationStateMachine.transition(conversation.status, event);
    if (!transition.valid) {
      return { conversation, transition };
    }

    const updates: Partial<Conversation> = {
      status: transition.nextState,
    };

    if (event.type === 'OPERATOR_ASSIGNED') {
      updates.assigned_to = event.operatorId || null;
    } else if (event.type === 'RELEASE_TO_BOT') {
      updates.assigned_to = null;
    } else if (event.type === 'CLOSE') {
      updates.closed_at = new Date().toISOString();
    } else if (event.type === 'REOPEN') {
      updates.closed_at = null;
    }

    const updated = await this.repo.updateConversation(conversationId, updates);
    return { conversation: updated, transition };
  }
}
