import { describe, it, expect } from 'vitest';
import { ConversationStateMachine } from '../conversation/conversation-state-machine.js';

describe('ConversationStateMachine', () => {
  describe('canAIGenerate guard', () => {
    it('allows AI generation only when status is "active"', () => {
      expect(ConversationStateMachine.canAIGenerate('active')).toBe(true);
      expect(ConversationStateMachine.canAIGenerate('waiting_for_human')).toBe(false);
      expect(ConversationStateMachine.canAIGenerate('human_active')).toBe(false);
      expect(ConversationStateMachine.canAIGenerate('closed')).toBe(false);
    });
  });

  describe('State transitions', () => {
    it('transitions from active to waiting_for_human when REQUEST_HUMAN is triggered', () => {
      const result = ConversationStateMachine.transition('active', {
        type: 'REQUEST_HUMAN',
        reason: 'Customer requested human agent',
      });
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('waiting_for_human');
    });

    it('transitions from waiting_for_human to human_active when OPERATOR_ASSIGNED', () => {
      const result = ConversationStateMachine.transition('waiting_for_human', {
        type: 'OPERATOR_ASSIGNED',
        operatorId: 'user_123',
      });
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('human_active');
    });

    it('transitions directly from active to human_active if operator intervenes', () => {
      const result = ConversationStateMachine.transition('active', {
        type: 'OPERATOR_ASSIGNED',
        operatorId: 'user_123',
      });
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('human_active');
    });

    it('transitions from human_active back to active when RELEASE_TO_BOT is fired', () => {
      const result = ConversationStateMachine.transition('human_active', {
        type: 'RELEASE_TO_BOT',
      });
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('active');
    });

    it('transitions from human_active to closed when conversation is resolved', () => {
      const result = ConversationStateMachine.transition('human_active', {
        type: 'CLOSE',
      });
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('closed');
    });

    it('re-opens a closed conversation when a new customer message arrives', () => {
      const result = ConversationStateMachine.transition('closed', {
        type: 'MESSAGE_RECEIVED',
        sender: 'user',
      });
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('active');
    });

    it('rejects invalid transitions gracefully', () => {
      const result = ConversationStateMachine.transition('closed', {
        type: 'OPERATOR_ASSIGNED',
      });
      expect(result.valid).toBe(false);
      expect(result.nextState).toBe('closed');
      expect(result.reason).toContain('Illegal state transition');
    });
  });
});
