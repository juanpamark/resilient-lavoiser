import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConversationService,
  InMemoryConversationRepository,
} from '../conversation/conversation.service.js';

describe('ConversationService', () => {
  let repo: InMemoryConversationRepository;
  let service: ConversationService;

  beforeEach(() => {
    repo = new InMemoryConversationRepository();
    service = new ConversationService(repo);
  });

  it('getOrCreateConversation returns existing active conversation or creates one', async () => {
    const conv1 = await service.getOrCreateConversation(
      'biz_1',
      'cust_1',
      'agent_1',
      'whatsapp'
    );
    expect(conv1.id).toBeDefined();
    expect(conv1.status).toBe('active');

    // Calling again returns the exact same conversation
    const conv2 = await service.getOrCreateConversation(
      'biz_1',
      'cust_1',
      'agent_1',
      'whatsapp'
    );
    expect(conv2.id).toBe(conv1.id);
  });

  it('processIncomingMessage deduplicates based on externalMessageId', async () => {
    const conv = await service.getOrCreateConversation(
      'biz_1',
      'cust_1',
      'agent_1',
      'whatsapp'
    );

    const firstReceipt = await service.processIncomingMessage({
      businessId: 'biz_1',
      conversationId: conv.id,
      externalMessageId: 'wamid.HBgM12345',
      content: 'Hola, buenas tardes',
    });

    expect(firstReceipt.isDuplicate).toBe(false);
    expect(firstReceipt.canAIGenerate).toBe(true);
    expect(firstReceipt.message.content).toBe('Hola, buenas tardes');

    // Duplicate message simulation (Meta retry)
    const duplicateReceipt = await service.processIncomingMessage({
      businessId: 'biz_1',
      conversationId: conv.id,
      externalMessageId: 'wamid.HBgM12345',
      content: 'Hola, buenas tardes',
    });

    expect(duplicateReceipt.isDuplicate).toBe(true);
    expect(duplicateReceipt.canAIGenerate).toBe(false);
    expect(duplicateReceipt.message.id).toBe(firstReceipt.message.id);
  });

  it('strictly mutes AI assistant generation when human is active', async () => {
    const conv = await service.getOrCreateConversation(
      'biz_1',
      'cust_1',
      'agent_1',
      'whatsapp'
    );

    // 1. Initially active: AI can respond
    const normalResponse = await service.processAssistantResponse({
      businessId: 'biz_1',
      conversationId: conv.id,
      content: '¡Hola! ¿En qué puedo colaborarte hoy?',
    });
    expect(normalResponse.muted).toBe(false);
    expect(normalResponse.message).toBeDefined();

    // 2. Escalation to human: customer asks for agent
    await service.transitionState(conv.id, {
      type: 'REQUEST_HUMAN',
      reason: 'Customer wants human support',
    });

    // In waiting_for_human: AI is muted
    const waitingResponse = await service.processAssistantResponse({
      businessId: 'biz_1',
      conversationId: conv.id,
      content: 'Intento de respuesta de IA',
    });
    expect(waitingResponse.muted).toBe(true);
    expect(waitingResponse.message).toBeNull();

    // 3. Operator claims conversation: human_active
    await service.transitionState(conv.id, {
      type: 'OPERATOR_ASSIGNED',
      operatorId: 'operator_daniela',
    });

    // In human_active: AI remains strictly muted
    const humanActiveResponse = await service.processAssistantResponse({
      businessId: 'biz_1',
      conversationId: conv.id,
      content: 'Intento de respuesta de IA cuando humano atiende',
    });
    expect(humanActiveResponse.muted).toBe(true);
    expect(humanActiveResponse.message).toBeNull();

    // 4. Operator returns conversation to bot
    await service.transitionState(conv.id, {
      type: 'RELEASE_TO_BOT',
    });

    // Now AI is unmuted and responds normally again
    const resumedResponse = await service.processAssistantResponse({
      businessId: 'biz_1',
      conversationId: conv.id,
      content: 'He retomado la atención, ¿deseas agregar algo más a tu pedido?',
    });
    expect(resumedResponse.muted).toBe(false);
    expect(resumedResponse.message).toBeDefined();
    expect(resumedResponse.message?.content).toContain('He retomado la atención');
  });
});
