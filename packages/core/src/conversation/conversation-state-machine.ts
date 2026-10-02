import type { ConversationStatus } from '../types/conversation.js';

export type ConversationEventType =
  | 'MESSAGE_RECEIVED'
  | 'REQUEST_HUMAN'
  | 'OPERATOR_ASSIGNED'
  | 'RELEASE_TO_BOT'
  | 'CLOSE'
  | 'REOPEN';

export interface ConversationEvent {
  type: ConversationEventType;
  sender?: 'user' | 'assistant' | 'human_agent';
  operatorId?: string;
  reason?: string;
}

export interface StateTransitionResult {
  nextState: ConversationStatus;
  valid: boolean;
  reason?: string;
}

export class ConversationStateMachine {
  /**
   * Evaluates if the AI model is authorized to generate an automated response.
   * If a human operator is active or the conversation is awaiting human pickup,
   * the AI bot is strictly muted to prevent collision with human staff.
   */
  static canAIGenerate(status: ConversationStatus): boolean {
    return status === 'active';
  }

  /**
   * Deterministic state transitions for conversation lifecycle
   */
  static transition(
    current: ConversationStatus,
    event: ConversationEvent
  ): StateTransitionResult {
    switch (current) {
      case 'active':
        if (event.type === 'REQUEST_HUMAN') {
          return { nextState: 'waiting_for_human', valid: true };
        }
        if (event.type === 'OPERATOR_ASSIGNED') {
          return { nextState: 'human_active', valid: true };
        }
        if (event.type === 'CLOSE') {
          return { nextState: 'closed', valid: true };
        }
        if (event.type === 'MESSAGE_RECEIVED') {
          return { nextState: 'active', valid: true };
        }
        break;

      case 'waiting_for_human':
        if (event.type === 'OPERATOR_ASSIGNED') {
          return { nextState: 'human_active', valid: true };
        }
        if (event.type === 'RELEASE_TO_BOT') {
          return { nextState: 'active', valid: true };
        }
        if (event.type === 'CLOSE') {
          return { nextState: 'closed', valid: true };
        }
        if (event.type === 'MESSAGE_RECEIVED') {
          // When waiting for human, new customer messages keep it in waiting state
          return { nextState: 'waiting_for_human', valid: true };
        }
        break;

      case 'human_active':
        if (event.type === 'RELEASE_TO_BOT') {
          return { nextState: 'active', valid: true };
        }
        if (event.type === 'CLOSE') {
          return { nextState: 'closed', valid: true };
        }
        if (event.type === 'MESSAGE_RECEIVED') {
          return { nextState: 'human_active', valid: true };
        }
        break;

      case 'closed':
        if (event.type === 'REOPEN' || event.type === 'MESSAGE_RECEIVED') {
          // New incoming message from customer automatically re-opens the dialogue into active AI state
          return { nextState: 'active', valid: true };
        }
        break;
    }

    return {
      nextState: current,
      valid: false,
      reason: `Illegal state transition from "${current}" on event "${event.type}"`,
    };
  }
}
