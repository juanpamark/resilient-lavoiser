'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import type { CustomJwtPayload, IndustryType } from '@platform/core';

export interface AgentConfigPayload {
  selectedIndustry?: IndustryType;
  tone: string;
  language: string;
  systemInstructions: string;
  faqs: Array<{ q: string; a: string }>;
  fewShots?: Array<{ user: string; assistant: string }>;
  returnPolicy: string;
  cancellationPolicy: string;
  enabledTools: string[];
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Resolves current user and business ID from session
 */
async function resolveAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase.auth as any).getUser();

  let businessId: string | null = null;
  let isPlatformAdmin = false;

  if (user) {
    const { data: sessionData } = await (supabase.auth as any).getSession();
    if (sessionData.session?.access_token) {
      try {
        const payloadBase64 = sessionData.session.access_token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8')
          ) as CustomJwtPayload;
          businessId = decoded.business_id || null;
          isPlatformAdmin = !!decoded.is_platform_admin;
        }
      } catch {
        // Fallback
      }
    }

    if (!businessId) {
      const { data: membership } = await supabase
        .from('memberships')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (membership?.business_id) {
        businessId = membership.business_id;
      }
    }
  }

  if (!businessId) {
    businessId = '00000000-0000-0000-0000-000000000001';
  }

  return { supabase, user, businessId, isPlatformAdmin };
}

/**
 * Fetches the active agent and its configuration for the current business.
 */
export async function getAgentConfigAction(): Promise<ActionResult<{
  businessName: string;
  agentId: string;
  config: AgentConfigPayload;
}>> {
  try {
    const { supabase, businessId } = await resolveAuthContext();

    // 1. Fetch business name
    const { data: biz } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .maybeSingle();

    const businessName = biz?.name || 'Restaurante Santa Cruz';

    // 2. Fetch or create agent for this business
    let { data: agent } = await supabase
      .from('agents')
      .select('id, name')
      .eq('business_id', businessId)
      .limit(1)
      .maybeSingle();

    if (!agent) {
      const { data: newAgent, error: createAgentError } = await supabase
        .from('agents')
        .insert({
          business_id: businessId,
          name: `agilizio — ${businessName}`,
          status: 'active',
        })
        .select('id, name')
        .single();

      if (createAgentError) {
        console.error('[getAgentConfigAction] Error creating agent:', createAgentError);
      } else {
        agent = newAgent;
      }
    }

    const agentId = agent?.id || 'agent_demo_01';

    // 3. Fetch latest active configuration
    let { data: configRow } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (configRow) {
      const personality = configRow.personality || {};
      const context = configRow.business_context || {};
      const policies = configRow.policies || {};
      const tools = Array.isArray(configRow.enabled_tools) ? configRow.enabled_tools : [];

      return {
        success: true,
        data: {
          businessName,
          agentId,
          config: {
            tone: personality.tone || 'amable y profesional',
            language: personality.language || 'es-CO (Español Colombia)',
            systemInstructions: configRow.system_instructions || '',
            faqs: Array.isArray(context.faq) ? context.faq : [],
            fewShots: Array.isArray(context.few_shots) ? context.few_shots : [],
            returnPolicy: policies.return_policy || '',
            cancellationPolicy: policies.cancellation_policy || '',
            enabledTools: tools,
          },
        },
      };
    }

    // Default configuration if no row exists in DB
    return {
      success: true,
      data: {
        businessName,
        agentId,
        config: {
          tone: 'amable, cálido, anfitrión y profesional',
          language: 'es-CO (Español Colombia)',
          systemInstructions:
            'Eres "agilizio", el asistente virtual y anfitrión oficial de Restaurante Santa Cruz por WhatsApp. Tu misión es brindar una cálida bienvenida a los comensales, detallar los platos de nuestra parrilla campesina, cortes madurados a la brasa y comida típica colombiana, gestionar reservas de mesas para eventos familiares o fines de semana, tomar pedidos a domicilio con exactitud matemática y responder con orgullo sobre nuestra sazón campestre.',
          faqs: [
            {
              q: '¿Cómo puedo reservar una mesa para el fin de semana o un evento familiar?',
              a: '¡Con gusto agendamos tu reserva! Indícanos la fecha, hora de llegada y cuántas personas te acompañarán. Para grupos de más de 8 personas te recomendamos reservar con al menos 24 horas de antelación.',
            },
            {
              q: '¿Tienen servicio a domicilio y en qué horarios?',
              a: 'Sí, despachamos domicilios todos los días de 11:30 AM a 8:30 PM. El tiempo estimado de entrega es de 35 a 45 minutos.',
            },
            {
              q: '¿Qué medios de pago reciben?',
              a: 'Aceptamos transferencias por Nequi, Daviplata, Bancolombia, pago contraentrega en efectivo y datáfono para tarjetas débito o crédito.',
            },
            {
              q: '¿Tienen parqueadero y zona campestre o para niños?',
              a: 'Sí, contamos con amplio parqueadero privado y vigilado sin costo para nuestros comensales, amplias áreas verdes y juegos infantiles.',
            },
          ],
          fewShots: [],
          returnPolicy:
            'En domicilios garantizamos la calidad y temperatura de nuestros platos. Ante cualquier inconveniente en la entrega, ofrecemos reposición inmediata sin costo.',
          cancellationPolicy:
            'Para reservas de mesa, puedes reagendar o cancelar sin costo hasta 2 horas antes de la hora acordada.',
          enabledTools: [
            'search_products',
            'calculate_order',
            'create_order',
            'check_availability',
            'book_appointment',
            'get_business_information',
            'transfer_to_human',
          ],
        },
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener configuración del agente';
    return { success: false, error: message };
  }
}

/**
 * Saves or updates the agent configuration for the current business in Supabase.
 */
export async function saveAgentConfigAction(payload: AgentConfigPayload): Promise<ActionResult> {
  try {
    const { supabase, businessId } = await resolveAuthContext();

    // 1. Fetch or create agent
    let { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('business_id', businessId)
      .limit(1)
      .maybeSingle();

    if (!agent) {
      const { data: newAgent, error: createAgentError } = await supabase
        .from('agents')
        .insert({
          business_id: businessId,
          name: 'agilizio — Agente Inteligente',
          status: 'active',
        })
        .select('id')
        .single();

      if (createAgentError) {
        return { success: false, error: createAgentError.message };
      }
      agent = newAgent;
    }

    const agentId = agent.id;

    // 2. Fetch current latest version
    const { data: latestConfig } = await supabase
      .from('agent_configs')
      .select('version')
      .eq('agent_id', agentId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latestConfig?.version || 0) + 1;

    // Deactivate previous versions
    await supabase
      .from('agent_configs')
      .update({ is_active: false })
      .eq('agent_id', agentId);

    // 3. Insert new version
    const { error: insertError } = await supabase
      .from('agent_configs')
      .insert({
        agent_id: agentId,
        version: nextVersion,
        system_instructions: payload.systemInstructions,
        personality: {
          tone: payload.tone,
          language: payload.language,
        },
        business_context: {
          faq: payload.faqs,
          few_shots: payload.fewShots || [],
        },
        policies: {
          return_policy: payload.returnPolicy,
          cancellation_policy: payload.cancellationPolicy,
        },
        enabled_tools: payload.enabledTools,
        model_config: {
          provider: 'gemini',
          model: 'gemini-3.5-flash',
          temperature: 0.7,
        },
        out_of_hours_behavior: 'bot_responds',
        human_handoff_trigger: 'Solicitud explícita de hablar con un encargado o quejas complejas',
        is_active: true,
      });

    if (insertError) {
      console.error('[saveAgentConfigAction] Error saving config:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/business/agent');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar la configuración del agente';
    return { success: false, error: message };
  }
}
