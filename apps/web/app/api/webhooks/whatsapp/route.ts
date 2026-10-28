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
  type Business,
  type AgentConfig,
} from '@platform/core';
import { AIOrchestrator, PromptInjectionGuard } from '@platform/ai';
import { ToolRegistry, registerDefaultTools } from '@platform/tools';
import { createClient } from '@/lib/supabase/server';

// Router & Services
const router = new InMemoryTenantChannelRouter();
const repo = new InMemoryConversationRepository();
const conversationService = new ConversationService(repo);
const whatsappClient = new WhatsAppClient();
const rateLimiter = new SlidingWindowRateLimiter();
const quotaManager = new TokenQuotaManager();
const auditLogger = new AuditLogger();

// Default pilot/demo connection for Restaurante Santa Cruz
const pilotBusinessId = '00000000-0000-0000-0000-000000000001';

router.registerConnection({
  id: 'conn_santa_cruz_01',
  businessId: pilotBusinessId,
  channelType: 'whatsapp',
  wabaId: process.env.WHATSAPP_WABA_ID || '109876543210987',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1412584025262699',
  accessToken: process.env.WHATSAPP_SYSTEM_USER_TOKEN || process.env.META_ACCESS_TOKEN || 'EAAB_test_mock_token_v21',
  billingType: 'client_direct_meta',
  isActive: true,
});

const defaultSantaCruzProducts = [
  { id: 'p1', name: 'Parrillada Especial Santa Cruz', description: 'Punta de anca, pechuga, costillitas, chorizo artesanal, arepa de choclo y papas criollas.', price: 75000, category: 'Parrilla & Carnes' },
  { id: 'p2', name: 'Churrasco a la Brasa 350g', description: 'Chatas maduradas al carbón con yuca y chimichurri casero.', price: 42000, category: 'Parrilla & Carnes' },
  { id: 'p3', name: 'Bandeja Típica Santa Cruz', description: 'Fríjoles campesinos, arroz, carne molida en paila, chicharrón crocante y aguacate.', price: 36000, category: 'Platos Típicos' },
  { id: 'p4', name: 'Costillas BBQ Ahumadas', description: 'Costillas tiernas en salsa BBQ artesanal con panela y papas a la francesa.', price: 38500, category: 'Parrilla & Carnes' },
  { id: 'p5', name: 'Cazuela de Mariscos Tradicional', description: 'Camarones, calamares y filete en crema de coco y cilantro fresco.', price: 48000, category: 'Pescados & Mariscos' },
  { id: 'p6', name: 'Picada Campesina Familiar', description: 'Lomo de cerdo, res, chicharrón, morcilla, plátano maduro con queso y arepitas.', price: 95000, category: 'Para Compartir' },
  { id: 'p7', name: 'Jugo Natural en Fruta Fresca', description: 'Fruta 100% natural (Mango, Maracuyá, Lulo o Mora) en agua o leche.', price: 7500, category: 'Bebidas' },
  { id: 'p8', name: 'Limonada de Coco Frappé', description: 'Leche de coco cremosa, jugo de limón fresco y menta.', price: 9500, category: 'Bebidas' },
];

const processor = new WhatsAppWebhookProcessor({
  router,
  conversationService,
  whatsappClient,
  rateLimiter,
  quotaManager,
  auditLogger,
  getMonthlyTokens: async (businessId: string) => {
    return 250_000;
  },
  resolveCustomer: async ({ businessId, phone, displayName }) => {
    return {
      id: `cust_${phone.replace(/[^0-9]/g, '')}`,
    };
  },
  aiResponder: async ({ userMessageText, customerName, businessId, conversationId }) => {
    // 1. Prompt Injection & Jailbreak Defense
    const guardCheck = PromptInjectionGuard.evaluate(userMessageText);
    if (!guardCheck.isSafe) {
      return {
        replyText: guardCheck.neutralFallbackResponse,
        inputTokens: 10,
        outputTokens: 20,
      };
    }

    // 2. Fetch live products from Supabase
    let products = defaultSantaCruzProducts;
    let businessName = 'Restaurante Santa Cruz';

    try {
      const supabase = await createClient();
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id, name, description, price, category')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (dbProducts && dbProducts.length > 0) {
        products = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: Number(p.price) || 0,
          category: p.category || 'Parrilla',
        }));
      }

      const { data: biz } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .maybeSingle();

      if (biz?.name) {
        businessName = biz.name;
      }
    } catch {
      // Fallback to local Santa Cruz catalog
    }

    // 3. If GEMINI_API_KEY is configured, execute Live AI Orchestrator
    if (process.env.GEMINI_API_KEY) {
      try {
        const toolRegistry = new ToolRegistry();
        registerDefaultTools(toolRegistry);

        const currentBusiness: Business = {
          id: businessId,
          name: businessName,
          description: 'Especialistas en carnes a la brasa, cortes madurados, gastronomía típica y eventos familiares.',
          status: 'active',
          timezone: 'America/Bogota',
          business_hours: {
            timezone: 'America/Bogota',
            days: {
              monday: { open: '11:30', close: '20:30', closed: false },
              tuesday: { open: '11:30', close: '20:30', closed: false },
              wednesday: { open: '11:30', close: '20:30', closed: false },
              thursday: { open: '11:30', close: '21:00', closed: false },
              friday: { open: '11:30', close: '22:00', closed: false },
              saturday: { open: '11:00', close: '22:00', closed: false },
              sunday: { open: '11:00', close: '20:30', closed: false },
            },
          },
          location: {
            address: 'Sede Campestre Km 4 Vía Principal',
            city: 'Santa Cruz',
            country: 'Colombia',
          },
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const agentConfig: AgentConfig = {
          id: 'cfg_live_wa',
          agent_id: 'agent_wa_01',
          version: 1,
          industry: 'food_and_beverage',
          system_instructions: `Eres "agilizio", el anfitrión y asistente virtual oficial de ${businessName} por WhatsApp. Atiende a ${customerName || 'nuestro comensal'} con calidez campesina, asesora sobre nuestros platos a la brasa, precios exactos en pesos colombianos y gestiona reservas de mesas y pedidos a domicilio.`,
          personality: { tone: 'cálido, atento y profesional', language: 'es-CO' },
          business_context: {
            overview: 'Carnes a la brasa, cortes madurados, platos típicos colombianos y bebidas naturales.',
            faq: [
              { question: '¿Cómo reservo mesa?', answer: 'Indícanos fecha, hora y número de personas con al menos 2 horas de anticipación.' },
              { question: '¿Horarios?', answer: 'Todos los días de 11:30 AM a 8:30 PM.' },
            ],
          },
          policies: {
            return_policy: 'Garantía de reposición inmediata en pedidos a domicilio.',
            cancellation_policy: 'Reagendamiento o cancelación sin costo hasta 2 horas antes de la reserva.',
          },
          few_shot_examples: [],
          enabled_tools: ['search_products', 'calculate_order', 'check_availability', 'get_business_information'],
          model_config: { provider: 'gemini', model: 'gemini-3.5-flash', temperature: 0.7 },
          out_of_hours_behavior: 'bot_responds',
          human_handoff_trigger: 'Solicitud explícita de hablar con un encargado o quejas',
          is_active: true,
          created_at: new Date().toISOString(),
        };

        const toolExecutor = async (name: string, args: Record<string, unknown>) => {
          if (name === 'search_products') {
            const query = typeof args.query === 'string' ? args.query.toLowerCase().trim() : '';
            const queryTokens = query.split(/[^a-záéíóú0-9]+/i).filter((w) => w.length > 2);
            const filtered = products.filter((p) => {
              if (!query || queryTokens.length === 0) return true;
              const target = `${p.name} ${p.description} ${p.category}`.toLowerCase();
              return queryTokens.some((token) => target.includes(token));
            });
            const results = filtered.length > 0 ? filtered : products;
            return {
              found_count: results.length,
              products: results.map((p) => ({
                name: p.name,
                price: p.price,
                description: p.description,
                category: p.category,
              })),
            };
          }
          if (name === 'get_business_information') {
            return {
              business_name: businessName,
              address: 'Km 4 Vía Principal, Santa Cruz',
              horarios: 'Lunes a Domingo de 11:30 AM a 8:30 PM',
              medios_de_pago: 'Nequi, Daviplata, Bancolombia, efectivo y tarjetas',
            };
          }
          return { status: 'executed', tool: name, args };
        };

        const orchestrator = new AIOrchestrator();
        const aiResult = await orchestrator.processMessage({
          business: currentBusiness,
          agentConfig,
          agentName: 'agilizio',
          conversationId,
          history: [],
          incomingUserText: userMessageText,
          availableTools: toolRegistry.exportDeclarations(agentConfig.enabled_tools),
          toolExecutor,
          maxToolIterations: 3,
        });

        if (aiResult.text) {
          return {
            replyText: aiResult.text,
            toolCallsExecuted: aiResult.toolCallsExecuted?.map((t) => t.name),
            inputTokens: aiResult.usage.inputTokens,
            outputTokens: aiResult.usage.outputTokens,
          };
        }
      } catch (err: any) {
        console.warn('Live AI WhatsApp error, using resilient responder:', err?.message);
      }
    }

    // 4. Resilient Fallback Responder for WhatsApp
    const query = userMessageText.toLowerCase();
    const greeting = customerName ? `¡Hola ${customerName}!` : '¡Hola!';

    if (
      query.includes('menu') ||
      query.includes('plato') ||
      query.includes('carta') ||
      query.includes('carne') ||
      query.includes('churrasco') ||
      query.includes('parrilla') ||
      query.includes('bandeja') ||
      query.includes('comida') ||
      query.includes('almorzar')
    ) {
      const sample = products.slice(0, 3).map((p) => `• *${p.name}* — $${p.price.toLocaleString('es-CO')}`).join('\n');
      return {
        replyText: `${greeting} Bienvenido a *${businessName}* 🥩🔥\n\nNuestras recomendaciones de la parrilla hoy:\n${sample}\n\n¿Te gustaría ordenar a domicilio o prefieres que te reservemos una mesa?`,
        inputTokens: 25,
        outputTokens: 70,
      };
    }

    if (query.includes('reserva') || query.includes('mesa') || query.includes('hora') || query.includes('evento')) {
      return {
        replyText: `${greeting} ¡Con gusto coordinamos tu mesa en *${businessName}*! 🌿🍽️\n\nPor favor indícanos:\n1. Día y hora de llegada\n2. Número de personas\n3. Si celebras alguna ocasión especial (cumpleaños, aniversario)`,
        inputTokens: 20,
        outputTokens: 50,
      };
    }

    return {
      replyText: `${greeting} Soy *agilizio*, el asistente virtual oficial de *${businessName}*. Te puedo ayudar con nuestra carta de carnes a la brasa, precios, reservas de mesas y pedidos a domicilio. ¿En qué te puedo colaborar hoy?`,
      inputTokens: 15,
      outputTokens: 45,
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

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    'platform_verify_secret_token';

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
    const appSecret =
      process.env.WHATSAPP_APP_SECRET ||
      process.env.META_APP_SECRET ||
      'test_meta_app_secret_123';

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
