import type {
  WhatsAppWebhookPayload,
  WhatsAppIncomingMessage,
  WhatsAppContact,
} from './types.js';
import { WhatsAppSignatureValidator } from './signature-validator.js';
import type { TenantChannelRouter, ChannelConnectionInfo } from './tenant-channel-router.js';
import type {
  ConversationService,
  SlidingWindowRateLimiter,
  TokenQuotaManager,
  AuditLogger,
} from '@platform/core';
import { PromptInjectionGuard } from '@platform/ai';
import type { WhatsAppClient } from './whatsapp-client.js';

export interface AIResponderContext {
  businessId: string;
  conversationId: string;
  customerPhone: string;
  customerName?: string;
  userMessageText: string;
  channelConnection: ChannelConnectionInfo;
}

export type AIResponderFn = (context: AIResponderContext) => Promise<{
  replyText: string;
  toolCallsExecuted?: string[];
  inputTokens?: number;
  outputTokens?: number;
}>;

export interface CustomerResolverFn {
  (params: {
    businessId: string;
    phone: string;
    displayName?: string;
  }): Promise<{ id: string }>;
}

export interface WebhookProcessorDependencies {
  router: TenantChannelRouter;
  conversationService: ConversationService;
  whatsappClient: WhatsAppClient;
  resolveCustomer: CustomerResolverFn;
  aiResponder?: AIResponderFn;
  defaultAgentId?: string;
  rateLimiter?: SlidingWindowRateLimiter;
  quotaManager?: TokenQuotaManager;
  auditLogger?: AuditLogger;
  getMonthlyTokens?: (businessId: string) => Promise<number>;
}

export interface ProcessWebhookInput {
  rawBody: string;
  signatureHeader?: string | null;
  appSecret?: string;
  skipSignatureCheck?: boolean;
}

export interface ProcessWebhookResult {
  success: boolean;
  statusCode: number;
  action:
    | 'processed_ai_reply'
    | 'silenced_human_active'
    | 'duplicate_ignored'
    | 'no_messages'
    | 'unauthorized'
    | 'tenant_not_found'
    | 'rate_limit_exceeded'
    | 'blocked_prompt_injection'
    | 'quota_exceeded'
    | 'error';
  businessId?: string;
  conversationId?: string;
  incomingMessageId?: string;
  customerPhone?: string;
  replySent?: string;
  error?: string;
}

export class WhatsAppWebhookProcessor {
  constructor(private deps: WebhookProcessorDependencies) {}

  /**
   * Processes an incoming WhatsApp Cloud API webhook request end-to-end
   */
  async process(input: ProcessWebhookInput): Promise<ProcessWebhookResult> {
    // 1. Signature Verification
    if (!input.skipSignatureCheck) {
      if (!input.appSecret) {
        return {
          success: false,
          statusCode: 500,
          action: 'error',
          error: 'Webhook app secret is not configured',
        };
      }

      const isValidSignature = WhatsAppSignatureValidator.validateSignature(
        input.rawBody,
        input.signatureHeader,
        input.appSecret
      );

      if (!isValidSignature) {
        return {
          success: false,
          statusCode: 401,
          action: 'unauthorized',
          error: 'Invalid HMAC SHA-256 signature in X-Hub-Signature-256',
        };
      }
    }

    // 2. Parse JSON payload
    let payload: WhatsAppWebhookPayload;
    try {
      payload = JSON.parse(input.rawBody) as WhatsAppWebhookPayload;
    } catch {
      return {
        success: false,
        statusCode: 400,
        action: 'error',
        error: 'Malformed JSON payload',
      };
    }

    // Extract first change value
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value || !value.metadata) {
      return {
        success: true,
        statusCode: 200,
        action: 'no_messages',
      };
    }

    const phoneNumberId = value.metadata.phone_number_id;
    const incomingMessages: WhatsAppIncomingMessage[] = value.messages || [];
    const contacts: WhatsAppContact[] = value.contacts || [];

    if (incomingMessages.length === 0) {
      // Could be a status update (delivered, read, sent) which we acknowledge with 200 OK
      return {
        success: true,
        statusCode: 200,
        action: 'no_messages',
      };
    }

    const firstMsg = incomingMessages[0];
    if (!firstMsg) {
      return {
        success: true,
        statusCode: 200,
        action: 'no_messages',
      };
    }

    // 3. Resolve Tenant Channel Connection by phone_number_id
    const channelConnection = await this.deps.router.resolveByPhoneNumberId(phoneNumberId);
    if (!channelConnection) {
      return {
        success: false,
        statusCode: 404,
        action: 'tenant_not_found',
        error: `No active channel connection found for phone_number_id: ${phoneNumberId}`,
      };
    }

    const businessId = channelConnection.businessId;
    const customerPhone = firstMsg.from;
    const customerContact = contacts.find((c) => c.wa_id === customerPhone);
    const customerName = customerContact?.profile?.name || undefined;

    // 3.1 Rate Limiter Check (Sliding Window per WhatsApp sender)
    if (this.deps.rateLimiter) {
      const rateLimit = this.deps.rateLimiter.checkWhatsAppSenderLimit(customerPhone);
      if (!rateLimit.allowed) {
        if (this.deps.auditLogger) {
          this.deps.auditLogger.log({
            businessId,
            action: 'RATE_LIMIT_EXCEEDED',
            resourceType: 'whatsapp_sender',
            resourceId: customerPhone,
            severity: 'warning',
            details: {
              customerPhone,
              resetInMs: rateLimit.resetInMs,
            },
          });
        }
        return {
          success: false,
          statusCode: 429,
          action: 'rate_limit_exceeded',
          businessId,
          customerPhone,
          error: 'Rate limit exceeded: too many requests in window (max 20 req/min)',
        };
      }
    }

    // 4. Resolve or create Customer
    const customer = await this.deps.resolveCustomer({
      businessId,
      phone: customerPhone,
      displayName: customerName,
    });

    // 5. Resolve or create Conversation
    const agentId = this.deps.defaultAgentId || 'default-agent-id';
    const conversation = await this.deps.conversationService.getOrCreateConversation(
      businessId,
      customer.id,
      agentId,
      'whatsapp'
    );

    // Extract textual content
    let content = '';
    if (firstMsg.type === 'text' && firstMsg.text?.body) {
      content = firstMsg.text.body;
    } else if (
      firstMsg.type === 'interactive' &&
      firstMsg.interactive?.button_reply?.title
    ) {
      content = firstMsg.interactive.button_reply.title;
    } else {
      content = `[Mensaje recibido tipo: ${firstMsg.type}]`;
    }

    // 6. Process incoming message through ConversationService (idempotency check)
    const receipt = await this.deps.conversationService.processIncomingMessage({
      businessId,
      conversationId: conversation.id,
      externalMessageId: firstMsg.id, // e.g. "wamid.HBgM..."
      content,
      contentType: 'text',
      channelMetadata: {
        wa_id: customerPhone,
        phone_number_id: phoneNumberId,
        waba_id: channelConnection.wabaId,
      },
    });

    if (receipt.isDuplicate) {
      return {
        success: true,
        statusCode: 200,
        action: 'duplicate_ignored',
        businessId,
        conversationId: conversation.id,
        incomingMessageId: receipt.message.id,
        customerPhone,
      };
    }

    // 7. Check state machine muting guard
    if (!receipt.canAIGenerate) {
      // Conversation is in human_active or waiting_for_human state.
      // AI bot is strictly muted!
      return {
        success: true,
        statusCode: 200,
        action: 'silenced_human_active',
        businessId,
        conversationId: receipt.conversation.id,
        incomingMessageId: receipt.message.id,
        customerPhone,
      };
    }

    // 7.1 Adversarial Prompt Injection Defense
    const guardResult = PromptInjectionGuard.evaluate(content);
    if (!guardResult.isSafe) {
      if (this.deps.auditLogger) {
        this.deps.auditLogger.log({
          businessId,
          action: 'PROMPT_INJECTION_BLOCKED',
          resourceType: 'conversation_message',
          resourceId: receipt.message.id,
          severity: 'critical',
          details: {
            reason: guardResult.reason,
            matchedPatterns: guardResult.matchedPatterns,
            rawContent: content,
          },
        });
      }

      const fallbackReply = guardResult.neutralFallbackResponse;

      await this.deps.conversationService.processAssistantResponse({
        businessId,
        conversationId: receipt.conversation.id,
        content: fallbackReply,
        inputTokens: 0,
        outputTokens: 0,
        modelUsed: 'prompt-guard-shield',
      });

      await this.deps.whatsappClient.sendTextMessage(
        phoneNumberId,
        customerPhone,
        fallbackReply,
        channelConnection.accessToken
      );

      return {
        success: true,
        statusCode: 200,
        action: 'blocked_prompt_injection',
        businessId,
        conversationId: receipt.conversation.id,
        incomingMessageId: receipt.message.id,
        customerPhone,
        replySent: fallbackReply,
      };
    }

    // 7.2 Monthly Token Quota Hard Cutoff Check
    if (this.deps.quotaManager && this.deps.getMonthlyTokens) {
      const currentMonthlyTokens = await this.deps.getMonthlyTokens(businessId);
      const quotaCheck = this.deps.quotaManager.checkQuota(businessId, currentMonthlyTokens);

      if (!quotaCheck.allowed) {
        if (this.deps.auditLogger) {
          this.deps.auditLogger.log({
            businessId,
            action: 'TOKEN_QUOTA_EXCEEDED',
            resourceType: 'token_quota',
            resourceId: businessId,
            severity: 'high',
            details: {
              currentMonthlyTokens,
              monthlyLimit: quotaCheck.monthlyLimit,
            },
          });
        }

        await this.deps.conversationService.transitionState(receipt.conversation.id, {
          type: 'REQUEST_HUMAN',
          reason: 'Límite de cuota mensual de tokens excedido',
        });

        const quotaNotice =
          'En este momento nuestras líneas automatizadas se encuentran en mantenimiento. Un asesor humano te responderá en breve.';

        await this.deps.conversationService.processAssistantResponse({
          businessId,
          conversationId: receipt.conversation.id,
          content: quotaNotice,
          inputTokens: 0,
          outputTokens: 0,
          modelUsed: 'system-quota-notice',
        });

        await this.deps.whatsappClient.sendTextMessage(
          phoneNumberId,
          customerPhone,
          quotaNotice,
          channelConnection.accessToken
        );

        return {
          success: true,
          statusCode: 200,
          action: 'quota_exceeded',
          businessId,
          conversationId: receipt.conversation.id,
          incomingMessageId: receipt.message.id,
          customerPhone,
          replySent: quotaNotice,
        };
      }
    }

    // 8. Generate AI Response
    let replyText = 'Gracias por comunicarte con nosotros. En breve te atenderemos.';
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    if (this.deps.aiResponder) {
      const aiResponse = await this.deps.aiResponder({
        businessId,
        conversationId: receipt.conversation.id,
        customerPhone,
        customerName,
        userMessageText: content,
        channelConnection,
      });

      replyText = aiResponse.replyText;
      inputTokens = aiResponse.inputTokens;
      outputTokens = aiResponse.outputTokens;
    }

    // 9. Record assistant message in conversation
    await this.deps.conversationService.processAssistantResponse({
      businessId,
      conversationId: receipt.conversation.id,
      content: replyText,
      inputTokens,
      outputTokens,
      modelUsed: 'gemini-2.5-flash',
    });

    // 10. Dispatch outbound message via WhatsApp Cloud API
    await this.deps.whatsappClient.sendTextMessage(
      phoneNumberId,
      customerPhone,
      replyText,
      channelConnection.accessToken
    );

    return {
      success: true,
      statusCode: 200,
      action: 'processed_ai_reply',
      businessId,
      conversationId: receipt.conversation.id,
      incomingMessageId: receipt.message.id,
      customerPhone,
      replySent: replyText,
    };
  }
}
