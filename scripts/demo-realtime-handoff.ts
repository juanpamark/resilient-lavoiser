import {
  ConversationStateMachine,
  ConversationService,
  InMemoryConversationRepository,
} from '../packages/core/src/index.js';
import { WhatsAppClient } from '../packages/channels/src/index.js';

async function main() {
  console.log('================================================================');
  console.log('⚡ DEMOSTRACIÓN DE HUMAN HANDOFF & REALTIME CHAT (FASE 10)');
  console.log('================================================================\n');

  const businessId = '018f3a5b-0001-7000-8000-000000000001';
  const customerId = 'cust_573012223344';
  const repo = new InMemoryConversationRepository();
  const conversationService = new ConversationService(repo);

  // 1. Simular inicio de conversación
  const conv = await conversationService.getOrCreateConversation(
    businessId,
    customerId,
    'agent_pilot_01',
    'whatsapp'
  );
  console.log(`[Paso 1] Conversación iniciada: ${conv.id}. Estado inicial: ${conv.status}`);

  // 2. Cliente envía un mensaje pidiendo ayuda humana urgente
  console.log('\n[Paso 2] Mensaje de cliente: "Hice el pedido #104 pero me equivoqué de dirección, auxilio"');
  await conversationService.processIncomingMessage({
    businessId,
    conversationId: conv.id,
    externalMessageId: 'wamid.HBgM_handoff_01',
    content: 'Hice el pedido #104 pero me equivoqué de dirección, auxilio',
  });

  // 3. La IA detecta la urgencia y ejecuta la tool transfer_to_human
  console.log('\n[Paso 3] AI ejecuta transfer_to_human -> Transición a "waiting_for_human"');
  const handoff = await conversationService.transitionState(conv.id, {
    type: 'REQUEST_HUMAN',
    reason: 'Modificación urgente de pedido en curso',
  });
  console.log(`[Realtime Broadcast] WebSocket emitiendo evento UPDATE conversations.`);
  console.log(`[Alert Chime] 🔔 SONIDO DE ALERTA ACTIVADO: Nueva conversación en espera (waiting_for_human).`);
  console.log(`Estado actual: ${handoff.conversation.status}`);
  console.log(`¿IA autorizada para responder?: ${ConversationStateMachine.canAIGenerate(handoff.conversation.status) ? 'SÍ' : 'NO (BOT SILENCIADO)'}`);

  // 4. Operador toma el control desde el dashboard
  console.log('\n[Paso 4] Asesor "Daniela" hace clic en "Tomar Control"');
  const claimed = await conversationService.transitionState(conv.id, {
    type: 'OPERATOR_ASSIGNED',
    operatorId: 'operator_daniela',
  });
  console.log(`Estado tras asignación: ${claimed.conversation.status}`);
  console.log(`Asignado a: ${claimed.conversation.assigned_to}`);
  console.log(`¿IA autorizada?: ${ConversationStateMachine.canAIGenerate(claimed.conversation.status) ? 'SÍ' : 'NO (SILENCIAMIENTO TOTAL)'}`);

  // 5. Operador envía respuesta humana por WhatsApp
  console.log('\n[Paso 5] Operador escribe respuesta en el panel');
  const humanReply = '¡Hola Mariana! Soy Daniela de soporte. No te preocupes, ya detuve la salida del pedido #104. Pásame la nueva dirección.';
  
  // Guardar mensaje humano
  await repo.createMessage({
    conversation_id: conv.id,
    business_id: businessId,
    role: 'human_agent',
    content_type: 'text',
    content: humanReply,
    external_message_id: null,
    tool_calls: null,
    tool_results: null,
    channel_metadata: { sent_by_operator: 'daniela' },
    input_tokens: null,
    output_tokens: null,
    model_used: null,
  });

  console.log(`[WhatsApp Graph API v21.0] Despachando mensaje humano a Meta: "${humanReply}"`);
  console.log(`[Realtime Broadcast] Mensaje reflejado en pantalla con badge "👤 Operador Humano".`);

  // 6. Asesor devuelve la conversación al bot tras solucionar el caso
  console.log('\n[Paso 6] Asesor finaliza su intervención y hace clic en "Devolver a IA"');
  const released = await conversationService.transitionState(conv.id, {
    type: 'RELEASE_TO_BOT',
  });
  console.log(`Estado final: ${released.conversation.status}`);
  console.log(`¿IA autorizada nuevamente?: ${ConversationStateMachine.canAIGenerate(released.conversation.status) ? 'SÍ (REANUDADA)' : 'NO'}`);

  console.log('\n================================================================');
  console.log('🎉 CICLO DE HUMAN HANDOFF & REALTIME LIVE CHAT VERIFICADO');
  console.log('================================================================');
}

main().catch(console.error);
