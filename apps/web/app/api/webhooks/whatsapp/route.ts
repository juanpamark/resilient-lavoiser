import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// TIPOS ESTRICTOS DEL PAYLOAD DE META WHATSAPP CLOUD API (CERO 'ANY')
// ============================================================================

interface WhatsAppTextObject {
  body: string;
}

interface WhatsAppInteractiveReply {
  id: string;
  title: string;
  description?: string;
}

interface WhatsAppInteractiveObject {
  type: 'button_reply' | 'list_reply';
  button_reply?: WhatsAppInteractiveReply;
  list_reply?: WhatsAppInteractiveReply;
}

interface WhatsAppIncomingMessage {
  from: string;
  id: string; // wamid único de Meta
  timestamp: string;
  type: 'text' | 'interactive' | 'audio' | 'image' | 'button' | 'unknown';
  text?: WhatsAppTextObject;
  interactive?: WhatsAppInteractiveObject;
  button?: { text?: string; payload?: string };
}

interface WhatsAppContactProfile {
  wa_id: string;
  profile?: {
    name?: string;
  };
}

interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

interface WhatsAppChangeValue {
  messaging_product: 'whatsapp';
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContactProfile[];
  messages?: WhatsAppIncomingMessage[];
  statuses?: Array<{
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    recipient_id: string;
  }>;
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    field: string;
    value: WhatsAppChangeValue;
  }>;
}

interface WhatsAppWebhookPayload {
  object: string;
  entry?: WhatsAppWebhookEntry[];
}

// ============================================================================
// TIPOS DE FILAS DE SUPABASE REQUERIDAS EN EL FLUJO
// ============================================================================

interface ChannelRecord {
  id: string;
  business_id: string;
  phone_number_id: string;
  access_token: string | null;
  is_active: boolean;
}

interface BusinessQuotaRecord {
  id: string;
  name: string;
  plan_tier?: 'trial' | 'despegue' | 'pro' | 'avanzado';
  trial_ends_at?: string | null;
  monthly_conversations_used?: number;
  monthly_conversation_limit?: number;
}

interface ConversationRecord {
  id: string;
  business_id: string;
  customer_id: string;
  status: 'active' | 'human_handoff' | 'closed' | string;
  ai_enabled: boolean;
}

interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'ai' | 'human' | 'system';
  content: string;
  created_at: string;
  external_message_id?: string | null;
}

interface CatalogProductRecord {
  name: string;
  price: number;
  is_available: boolean;
  category?: string | null;
}

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiRestResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiCandidatePart[];
    };
  }>;
}

// ============================================================================
// CACHÉ DE IDEMPOTENCIA EN MEMORIA (PRIMERA BARRERA ULTRA RÁPIDA)
// ============================================================================

const PROCESSED_WAMIDS_CACHE = new Map<string, number>();
const WAMID_TTL_MS = 1000 * 60 * 15; // 15 minutos
const MESSAGE_BURST_DEBOUNCE_MS = 1800; // 1.8s para agrupar ráfagas de WhatsApp

function isWamidRecentlyProcessed(wamid: string): boolean {
  const now = Date.now();
  for (const [key, timestamp] of PROCESSED_WAMIDS_CACHE.entries()) {
    if (now - timestamp > WAMID_TTL_MS) {
      PROCESSED_WAMIDS_CACHE.delete(key);
    }
  }
  if (PROCESSED_WAMIDS_CACHE.has(wamid)) {
    return true;
  }
  PROCESSED_WAMIDS_CACHE.set(wamid, now);
  return false;
}

function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string | undefined
): boolean {
  if (!appSecret) {
    // Si no se ha configurado WHATSAPP_APP_SECRET en desarrollo, permitir paso
    return true;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const receivedHash = signatureHeader.slice('sha256='.length);
  const expectedBuffer = Buffer.from(expectedHash, 'utf8');
  const receivedBuffer = Buffer.from(receivedHash, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function extractMessageText(message: WhatsAppIncomingMessage): string | null {
  if (message.type === 'text' && message.text?.body) {
    return message.text.body.trim();
  }
  if (message.type === 'interactive' && message.interactive) {
    return (
      message.interactive.button_reply?.title ??
      message.interactive.list_reply?.title ??
      null
    );
  }
  if (message.type === 'button' && message.button?.text) {
    return message.button.text.trim();
  }
  return null;
}

// ============================================================================
// GET: VERIFICACIÓN DEL WEBHOOK CON META CLOUD API
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedVerifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN ?? 'agilizio_verify_token';

  if (mode === 'subscribe' && token === expectedVerifyToken && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json(
    { error: 'Token de verificación de WhatsApp inválido' },
    { status: 403 }
  );
}

// ============================================================================
// POST: RECEPCIÓN IDEMPOTENTE, CONSOLIDACIÓN DE RÁFAGAS Y GUARDIA DE HANDOFF
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  // 1. Validar firma criptográfica X-Hub-Signature-256
  const signature = request.headers.get('x-hub-signature-256');
  const isSignatureValid = verifyMetaSignature(
    rawBody,
    signature,
    process.env.WHATSAPP_APP_SECRET
  );

  if (!isSignatureValid) {
    return NextResponse.json(
      { error: 'Firma X-Hub-Signature-256 inválida' },
      { status: 401 }
    );
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'JSON malformado' }, { status: 400 });
  }

  const changeValue = payload.entry?.[0]?.changes?.[0]?.value;
  if (!changeValue) {
    return NextResponse.json({ status: 'ignored_no_changes' }, { status: 200 });
  }

  // Ignorar silenciosamente eventos de estado (sent, delivered, read)
  if (!changeValue.messages || changeValue.messages.length === 0) {
    return NextResponse.json({ status: 'status_update_ack' }, { status: 200 });
  }

  const incomingMessage = changeValue.messages[0];
  const wamid = incomingMessage.id;
  const customerPhone = incomingMessage.from;
  const customerName =
    changeValue.contacts?.[0]?.profile?.name ?? `Cliente ${customerPhone.slice(-4)}`;
  const phoneNumberId = changeValue.metadata.phone_number_id;
  const incomingText = extractMessageText(incomingMessage);

  if (!incomingText) {
    return NextResponse.json(
      { status: 'unsupported_message_type_ack', wamid },
      { status: 200 }
    );
  }

  // 2. PRIMERA BARRERA DE IDEMPOTENCIA (Caché en memoria)
  if (isWamidRecentlyProcessed(wamid)) {
    return NextResponse.json(
      { status: 'duplicate_wamid_cached', wamid },
      { status: 200 }
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { status: 'ack_missing_supabase_env', wamid },
      { status: 200 }
    );
  }

  try {
    // 3. RESOLVER EL TENANT (RESTAURANTE) POR EL PHONE_NUMBER_ID DE META
    const { data: channelData } = await supabase
      .from('channels')
      .select('id, business_id, phone_number_id, access_token, is_active')
      .eq('phone_number_id', phoneNumberId)
      .eq('is_active', true)
      .maybeSingle<ChannelRecord>();

    if (!channelData) {
      return NextResponse.json(
        { status: 'unregistered_channel_ack', phoneNumberId },
        { status: 200 }
      );
    }

    const businessId = channelData.business_id;

    // 4. OBTENER O CREAR EL COMENSAL Y LA CONVERSACIÓN ACTIVA
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', businessId)
      .eq('phone', customerPhone)
      .maybeSingle<{ id: string }>();

    let customerId = existingCustomer?.id;
    if (!customerId) {
      const { data: createdCustomer } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          phone: customerPhone,
          name: customerName,
        })
        .select('id')
        .single<{ id: string }>();
      customerId = createdCustomer?.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { status: 'customer_creation_failed_ack' },
        { status: 200 }
      );
    }

    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id, business_id, customer_id, status, ai_enabled')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<ConversationRecord>();

    let conversation = existingConv;
    if (!conversation) {
      const { data: createdConv } = await supabase
        .from('conversations')
        .insert({
          business_id: businessId,
          customer_id: customerId,
          channel_id: channelData.id,
          status: 'active',
          ai_enabled: true,
        })
        .select('id, business_id, customer_id, status, ai_enabled')
        .single<ConversationRecord>();
      conversation = createdConv;
    }

    if (!conversation) {
      return NextResponse.json(
        { status: 'conversation_init_failed_ack' },
        { status: 200 }
      );
    }

    // 5. SEGUNDA BARRERA DE IDEMPOTENCIA ATÓMICA EN BASE DE DATOS
    const messageTimestampIso = new Date().toISOString();
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        business_id: businessId,
        conversation_id: conversation.id,
        sender_type: 'customer',
        content: incomingText,
        external_message_id: wamid,
        created_at: messageTimestampIso,
      })
      .select('id, created_at')
      .maybeSingle<{ id: string; created_at: string }>();

    // Código PostgreSQL 23505 = unique_violation (Meta reintentó el mismo wamid)
    if (insertError?.code === '23505') {
      return NextResponse.json(
        { status: 'duplicate_wamid_db_locked', wamid },
        { status: 200 }
      );
    }

    const currentMessageCreatedAt =
      insertedMessage?.created_at ?? messageTimestampIso;

    // 6. VERIFICACIÓN TEMPRANA DE HANDOFF HUMANO (PRE-INFERENCIA)
    if (
      conversation.status === 'human_handoff' ||
      conversation.ai_enabled === false
    ) {
      return NextResponse.json(
        {
          status: 'skipped_human_handoff_active',
          conversationId: conversation.id,
        },
        { status: 200 }
      );
    }

    // 7. CONTROL DE RÁFAGAS DE MENSAJES (DEBOUNCING COORDINADO EN POSTGRESQL)
    // Esperamos 1.8s por si el comensal está escribiendo en múltiples burbujas seguidas
    await new Promise((resolve) =>
      setTimeout(resolve, MESSAGE_BURST_DEBOUNCE_MS)
    );

    const { data: newerCustomerMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversation.id)
      .eq('sender_type', 'customer')
      .gt('created_at', currentMessageCreatedAt)
      .limit(1);

    if (newerCustomerMessages && newerCustomerMessages.length > 0) {
      // Entró otro mensaje más reciente del usuario durante la ventana de 1.8s.
      // Abortamos esta ejecución para que la última invocación responda todo junto.
      return NextResponse.json(
        {
          status: 'coalesced_into_newer_message_burst',
          wamid,
        },
        { status: 200 }
      );
    }

    // 8. VERIFICAR CUOTA Y ESTADO DE REVERSE TRIAL DEL RESTAURANTE
    const { data: businessData } = await supabase
      .from('businesses')
      .select(
        'id, name, plan_tier, trial_ends_at, monthly_conversations_used, monthly_conversation_limit'
      )
      .eq('id', businessId)
      .maybeSingle<BusinessQuotaRecord>();

    if (
      businessData?.plan_tier === 'trial' &&
      businessData.trial_ends_at &&
      new Date(businessData.trial_ends_at).getTime() < Date.now()
    ) {
      // Trial expirado: pasamos a Handoff suave sin perder el mensaje en bandeja
      await supabase
        .from('conversations')
        .update({ status: 'human_handoff', ai_enabled: false })
        .eq('id', conversation.id);

      return NextResponse.json(
        { status: 'trial_expired_routed_to_inbox' },
        { status: 200 }
      );
    }

    // 9. CARGAR CONTEXTO RECIENTE (CONCATENANDO RÁFAGA) + MENÚ DISPONIBLE (RESPETANDO 86)
    const [{ data: recentMessages }, { data: catalogItems }] =
      await Promise.all([
        supabase
          .from('messages')
          .select('id, conversation_id, sender_type, content, created_at')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(10)
          .returns<MessageRecord[]>(),
        supabase
          .from('products')
          .select('name, price, is_available, category')
          .eq('business_id', businessId)
          .returns<CatalogProductRecord[]>(),
      ]);

    const orderedHistory = (recentMessages ?? []).reverse();
    const availableMenuText = (catalogItems ?? [])
      .filter((p) => p.is_available)
      .map((p) => `- ${p.name}: $${p.price.toLocaleString('es-CO')} COP`)
      .join('\n');

    const soldOutMenuText = (catalogItems ?? [])
      .filter((p) => !p.is_available)
      .map((p) => p.name)
      .join(', ');

    // 10. GENERAR RESPUESTA CON GEMINI 2.5 FLASH
    const aiReplyText = await generateRestaurantAiReply({
      businessName: businessData?.name ?? 'Restaurante Aliado',
      customerName,
      availableMenuText,
      soldOutMenuText,
      history: orderedHistory,
    });

    // 11. GUARDIÁN POST-INFERENCIA CRÍTICO (EVITA RACE CONDITION CON EL CAJERO)
    // Re-consultamos el estado exacto de la conversación antes de disparar a WhatsApp
    const { data: freshConvState } = await supabase
      .from('conversations')
      .select('status, ai_enabled')
      .eq('id', conversation.id)
      .maybeSingle<{ status: string; ai_enabled: boolean }>();

    if (
      freshConvState?.status === 'human_handoff' ||
      freshConvState?.ai_enabled === false
    ) {
      return NextResponse.json(
        {
          status: 'aborted_post_inference_human_intervened',
          conversationId: conversation.id,
        },
        { status: 200 }
      );
    }

    // 12. PERSISTIR RESPUESTA DE LA IA Y ENVIAR A META CLOUD API
    await supabase.from('messages').insert({
      business_id: businessId,
      conversation_id: conversation.id,
      sender_type: 'ai',
      content: aiReplyText,
    });

    const metaAccessToken =
      channelData.access_token ?? process.env.WHATSAPP_ACCESS_TOKEN;

    if (metaAccessToken) {
      await dispatchWhatsAppTextMessage({
        phoneNumberId,
        accessToken: metaAccessToken,
        recipientPhone: customerPhone,
        text: aiReplyText,
      });
    }

    return NextResponse.json(
      {
        status: 'dispatched_ai_reply',
        wamid,
        conversationId: conversation.id,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error interno en webhook';
    // Siempre devolvemos 200 OK ante errores de lógica interna para evitar tormentas de reintentos de Meta
    return NextResponse.json(
      { status: 'handled_error_ack', detail: errorMessage },
      { status: 200 }
    );
  }
}

// ============================================================================
// FUNCIONES AUXILIARES: GEMINI 2.5 FLASH Y DESPACHO META GRAPH API
// ============================================================================

async function generateRestaurantAiReply(params: {
  businessName: string;
  customerName: string;
  availableMenuText: string;
  soldOutMenuText: string;
  history: MessageRecord[];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const conversationTranscript = params.history
    .map(
      (m) =>
        `${m.sender_type === 'customer' ? 'Comensal' : 'Agente'}: ${m.content}`
    )
    .join('\n');

  const systemPrompt = [
    `Eres el anfitrión y recepcionista experto de ${params.businessName} en WhatsApp.`,
    `Atiendes a ${params.customerName} con hospitalidad gastronómica, respuestas concisas y enfoque en cierre de pedido.`,
    `Si pide cortes de res, pregunta siempre término de cocción (1/2, 3/4, bien asado) y guarnición.`,
    params.availableMenuText
      ? `MENÚ DISPONIBLE HOY:\n${params.availableMenuText}`
      : '',
    params.soldOutMenuText
      ? `PLATOS AGOTADOS HOY (86 - NO OFRECER): ${params.soldOutMenuText}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!apiKey) {
    return `¡Hola ${params.customerName}! Bienvenido a ${params.businessName}. ¿Qué corte o plato te gustaría pedir hoy y para qué barrio va tu domicilio?`;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Historial reciente de la conversación (si el cliente envió varios mensajes seguidos, responde a todos en un solo mensaje coherente):\n${conversationTranscript}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 320,
        },
      }),
    }
  );

  if (!response.ok) {
    return `¡Hola ${params.customerName}! Estamos tomando tu pedido en ${params.businessName}. ¿Me confirmas por favor tus platos y dirección de entrega?`;
  }

  const data = (await response.json()) as GeminiRestResponse;
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  return (
    reply ??
    `¡Con gusto, ${params.customerName}! ¿Me confirmas por favor el término de tu corte y tu dirección para registrar la comanda?`
  );
}

async function dispatchWhatsAppTextMessage(params: {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  text: string;
}): Promise<void> {
  await fetch(
    `https://graph.facebook.com/v21.0/${params.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.recipientPhone,
        type: 'text',
        text: { preview_url: false, body: params.text },
      }),
    }
  );
}
