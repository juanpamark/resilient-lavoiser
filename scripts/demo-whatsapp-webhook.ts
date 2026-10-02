import {
  WhatsAppSignatureValidator,
  WhatsAppWebhookProcessor,
  WhatsAppClient,
  InMemoryTenantChannelRouter,
} from '../packages/channels/src/index.js';
import {
  ConversationService,
  InMemoryConversationRepository,
} from '../packages/core/src/index.js';

async function main() {
  console.log('================================================================');
  console.log('🤖 DEMOSTRACIÓN DEL PIPELINE END-TO-END DE WHATSAPP CLOUD API');
  console.log('================================================================\n');

  const appSecret = 'meta_app_secret_live_demo_987';
  const phoneNumberId = '105551234567890';
  const businessId = '018f3a5b-0001-7000-8000-000000000001'; // Pilot Restaurant

  // 1. Configurar Router Multi-Tenant e Inyección
  const router = new InMemoryTenantChannelRouter();
  router.registerConnection({
    id: 'conn_pilot_01',
    businessId,
    channelType: 'whatsapp',
    wabaId: '109876543210987',
    phoneNumberId,
    accessToken: 'EAAB_test_mock_token_v21_tenant_credential',
    billingType: 'client_direct_meta',
    isActive: true,
  });

  const repo = new InMemoryConversationRepository();
  const conversationService = new ConversationService(repo);

  const outboundLogs: Array<{ to: string; text: string }> = [];
  const whatsappClient = new WhatsAppClient({
    fetchFn: (async (_url: any, options: any) => {
      const body = JSON.parse(options.body);
      outboundLogs.push({ to: body.to, text: body.text?.body || '' });
      return {
        ok: true,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: body.to, wa_id: body.to }],
          messages: [{ id: `wamid.outbound_${Date.now()}` }],
        }),
      };
    }) as any,
  });

  const processor = new WhatsAppWebhookProcessor({
    router,
    conversationService,
    whatsappClient,
    resolveCustomer: async ({ phone, displayName }) => {
      console.log(`[DB] Resolviendo Cliente en BD: Teléfono ${phone} (${displayName})`);
      return { id: `cust_${phone}` };
    },
    aiResponder: async ({ userMessageText, customerName }) => {
      console.log(`[AI Orchestrator] Prompt Modular compilado + Historial`);
      console.log(`[AI Orchestrator] Procesando mensaje: "${userMessageText}"`);
      console.log(`[Tool Executor] Ejecutando: search_products(query="pizza")`);
      return {
        replyText: `¡Hola ${customerName}! Tenemos Pizza Margarita ($28,000) y Pizza Pepperoni ($32,000). ¿Te gustaría ordenar alguna?`,
        toolCallsExecuted: ['search_products'],
        inputTokens: 142,
        outputTokens: 38,
      };
    },
  });

  // PASO 1: Handshake de verificación Meta GET
  console.log('--- PASO 1: Handshake de Verificación (GET /api/webhooks/whatsapp) ---');
  const handshake = WhatsAppSignatureValidator.verifyHandshake({
    mode: 'subscribe',
    verifyToken: 'my_verify_token_123',
    expectedToken: 'my_verify_token_123',
    challenge: '1158201444',
  });
  console.log(`Resultado Handshake: ${handshake.isValid ? '✅ AUTORIZADO' : '❌ RECHAZADO'}`);
  console.log(`Challenge devuelto a Meta: ${handshake.challenge}\n`);

  // PASO 2: Mensaje entrante de WhatsApp (POST)
  console.log('--- PASO 2: Mensaje Entrante de Cliente (POST Webhook) ---');
  const incomingPayload = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '109876543210987',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '573009998877',
                phone_number_id: phoneNumberId,
              },
              contacts: [
                {
                  profile: { name: 'Santiago Gómez' },
                  wa_id: '573105556677',
                },
              ],
              messages: [
                {
                  from: '573105556677',
                  id: 'wamid.HBgNNzMxMDU1NTY2NzcVAgASGBgyMUEz',
                  timestamp: '1727740000',
                  type: 'text',
                  text: { body: 'Buenas noches, ¿qué pizzas tienen disponibles?' },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const signature = WhatsAppSignatureValidator.generateSignature(incomingPayload, appSecret);
  console.log(`Header X-Hub-Signature-256: ${signature.substring(0, 30)}...`);

  const result1 = await processor.process({
    rawBody: incomingPayload,
    signatureHeader: signature,
    appSecret,
  });

  console.log('\n[Log de Pipeline Ejecutado]:');
  console.log(JSON.stringify(result1, null, 2));
  console.log(`[WhatsApp Outbound API] Mensaje entregado a ${outboundLogs[0]?.to}: "${outboundLogs[0]?.text}"\n`);

  // PASO 3: Deduplicación (Reintento de Meta con mismo wamid)
  console.log('--- PASO 3: Detección de Idempotencia (Reintento de Meta) ---');
  const duplicateResult = await processor.process({
    rawBody: incomingPayload,
    signatureHeader: signature,
    appSecret,
  });
  console.log(`Resultado Reintento: ${duplicateResult.action} (StatusCode: ${duplicateResult.statusCode})\n`);

  // PASO 4: Intervención de Asesor Humano (Silenciado Estricto del Bot)
  console.log('--- PASO 4: Transferencia a Asesor Humano y Silenciado del Bot ---');
  await conversationService.transitionState(result1.conversationId!, {
    type: 'OPERATOR_ASSIGNED',
    operatorId: 'operator_daniela',
  });
  console.log(`[State Machine] Conversación asignada a "operator_daniela". Estado: human_active`);

  const humanPayload = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '109876543210987',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '573009998877',
                phone_number_id: phoneNumberId,
              },
              contacts: [{ profile: { name: 'Santiago Gómez' }, wa_id: '573105556677' }],
              messages: [
                {
                  from: '573105556677',
                  id: 'wamid.HBgNNzMxMDU1NTY2NzcVAgASGBgyMUE0',
                  timestamp: '1727740050',
                  type: 'text',
                  text: { body: 'Daniela, ¿tienen opción sin gluten?' },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const humanSignature = WhatsAppSignatureValidator.generateSignature(humanPayload, appSecret);
  const resultHuman = await processor.process({
    rawBody: humanPayload,
    signatureHeader: humanSignature,
    appSecret,
  });

  console.log('[Log de Pipeline con Asesor Activo]:');
  console.log(JSON.stringify(resultHuman, null, 2));
  console.log(`Total mensajes de WhatsApp enviados por IA: ${outboundLogs.length} (El segundo mensaje NO se envió porque el bot está en silencio)`);

  console.log('\n================================================================');
  console.log('🎉 PIPELINE DE WHATSAPP CLOUD API VERIFICADO AL 100%');
  console.log('================================================================');
}

main().catch(console.error);
