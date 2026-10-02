import { NextRequest, NextResponse } from 'next/server';
import {
  WhatsAppSignatureValidator,
  WhatsAppWebhookProcessor,
  WhatsAppClient,
  InMemoryTenantChannelRouter,
  type ChannelConnectionInfo,
} from '@platform/channels';
import {
  ConversationService,
  InMemoryConversationRepository,
  SlidingWindowRateLimiter,
  TokenQuotaManager,
  AuditLogger,
} from '@platform/core';

// In-memory router for local dev/testing; in production connected with Supabase admin client
const router = new InMemoryTenantChannelRouter();
const repo = new InMemoryConversationRepository();
const conversationService = new ConversationService(repo);
const whatsappClient = new WhatsAppClient();
const rateLimiter = new SlidingWindowRateLimiter();
const quotaManager = new TokenQuotaManager();
const auditLogger = new AuditLogger();

// Register a default test connection for the pilot tenant
router.registerConnection({
  id: 'conn_pilot_01',
  businessId: '018f3a5b-0001-7000-8000-000000000001',
  channelType: 'whatsapp',
  wabaId: '109876543210987',
  phoneNumberId: '105551234567890',
  accessToken: process.env.WHATSAPP_SYSTEM_USER_TOKEN || 'EAAB_test_mock_token_v21',
  billingType: 'client_direct_meta',
  isActive: true,
});

const processor = new WhatsAppWebhookProcessor({
  router,
  conversationService,
  whatsappClient,
  rateLimiter,
  quotaManager,
  auditLogger,
  getMonthlyTokens: async (businessId: string) => {
    // In production, queries v_monthly_ai_usage for current billing cycle
    return 150_000;
  },
  resolveCustomer: async ({ businessId, phone, displayName }) => {
    // In production, queries or inserts into `customers` table
    return {
      id: `cust_${phone.replace(/[^0-9]/g, '')}`,
    };
  },
  aiResponder: async ({ userMessageText, customerName }) => {
    // Basic AI response generation or AIOrchestrator dispatch
    const greeting = customerName ? `¡Hola ${customerName}!` : '¡Hola!';
    return {
      replyText: `${greeting} Recibí tu mensaje: "${userMessageText}". ¿En qué puedo asistirte hoy?`,
      inputTokens: 15,
      outputTokens: 25,
    };
  },
});

/**
 * GET /api/webhooks/whatsapp
 * Meta Webhook Handshake Verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'platform_verify_secret_token';

  const verification = WhatsAppSignatureValidator.verifyHandshake({
    mode,
    verifyToken: token,
    expectedToken,
    challenge,
  });

  if (verification.isValid && verification.challenge) {
    return new Response(verification.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('Verification failed', { status: 403 });
}

/**
 * POST /api/webhooks/whatsapp
 * Meta Cloud API Ingestion Endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.WHATSAPP_APP_SECRET || 'test_meta_app_secret_123';

    // In dev/test if app secret is not enforced, allow skip or validate
    const skipCheck = process.env.NODE_ENV === 'test' && !signature;

    const result = await processor.process({
      rawBody,
      signatureHeader: signature,
      appSecret,
      skipSignatureCheck: skipCheck,
    });

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        action: 'error',
        error: error?.message || 'Internal server error processing webhook',
      },
      { status: 500 }
    );
  }
}
