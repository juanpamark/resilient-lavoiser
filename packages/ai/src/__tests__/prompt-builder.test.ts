import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../orchestrator/prompt-builder.js';
import type { Business, AgentConfig, Customer } from '@platform/core';

describe('PromptBuilder', () => {
  it('should assemble a comprehensive modular prompt for a Restaurant business', () => {
    const restaurantBusiness: Business = {
      id: 'bus-rest-1',
      name: 'Burger & Co.',
      description: 'Hamburguesería artesanal con ingredientes locales.',
      status: 'active',
      timezone: 'America/Bogota',
      business_hours: {
        timezone: 'America/Bogota',
        days: {
          monday: { open: '12:00', close: '22:00', closed: false },
          tuesday: { open: '12:00', close: '22:00', closed: false },
        },
      },
      location: {
        address: 'Carrera 7 # 72-10',
        city: 'Bogotá',
        country: 'Colombia',
      },
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const restaurantConfig: AgentConfig = {
      id: 'cfg-1',
      agent_id: 'agent-1',
      version: 1,
      system_instructions: 'Guía a los comensales en el menú y toma sus órdenes con entusiasmo.',
      personality: { tone: 'juvenil y servicial', language: 'es-CO' },
      business_context: {
        overview: 'Servimos hamburguesas en pan brioche artesanal.',
        faq: [{ question: '¿Tienen opciones veganas?', answer: 'Sí, hamburguesa de lentejas.' }],
      },
      policies: {
        return_policy: 'Cambio inmediato en caso de inconvenientes con el pedido.',
        cancellation_policy: 'Hasta 5 minutos después del pedido.',
      },
      enabled_tools: ['search_products', 'create_order'],
      model_config: { provider: 'gemini', model: 'gemini-2.0-flash' },
      out_of_hours_behavior: 'bot_responds',
      human_handoff_trigger: 'Solicitud de hablar con el chef o supervisor',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const customer: Customer = {
      id: 'cust-1',
      business_id: 'bus-rest-1',
      external_id: '+573001112233',
      channel_type: 'whatsapp',
      display_name: 'Santiago',
      phone: '+573001112233',
      profile: { preferred_sauce: 'bbq' },
      metadata: {},
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const prompt = PromptBuilder.build({
      agentName: 'BurgerBot',
      config: restaurantConfig,
      business: restaurantBusiness,
      customer,
    });

    expect(prompt).toContain('### 1. IDENTIDAD Y OBJETIVO');
    expect(prompt).toContain('BurgerBot');
    expect(prompt).toContain('Burger & Co.');
    expect(prompt).toContain('Carrera 7 # 72-10');
    expect(prompt).toContain('Santiago');
    expect(prompt).toContain('DIRECTRICES DE ATENCIÓN Y HERRAMIENTAS');
    expect(prompt).toContain('NUNCA inventes precios');
  });

  it('should assemble an equally coherent prompt for a Dental Clinic business with multi-industry and few-shot rules', () => {
    const dentalClinic: Business = {
      id: 'bus-dent-1',
      name: 'Clínica Odontológica Sonrisas',
      description: 'Centro odontológico especializado en ortodoncia e implantes.',
      status: 'active',
      timezone: 'America/Bogota',
      business_hours: {
        timezone: 'America/Bogota',
        days: {
          monday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '13:00', closed: false },
        },
      },
      location: {
        address: 'Calle 100 # 19-61 Consultorio 402',
        city: 'Bogotá',
        country: 'Colombia',
      },
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const dentalConfig: AgentConfig = {
      id: 'cfg-2',
      agent_id: 'agent-2',
      version: 1,
      industry: 'health_and_wellness',
      system_instructions: 'Orienta a los pacientes sobre tratamientos y agenda sus citas de valoración.',
      personality: { tone: 'formal, empático y médico', language: 'es-CO' },
      business_context: {
        overview: 'Contamos con especialistas en ortodoncia invisible y diseño de sonrisa.',
        faq: [{ question: '¿La valoración tiene costo?', answer: 'La primera consulta de valoración es gratuita.' }],
      },
      policies: {
        cancellation_policy: 'Reagendamiento permitido con mínimo 24 horas de anticipación.',
        special_notes: 'Pacientes con dolor agudo deben acudir a urgencias presenciales.',
      },
      few_shot_examples: [
        {
          user: '¿Tienen cita para mañana a las 3pm?',
          assistant: 'Con gusto verifico la agenda del Dr. Gómez para mañana a las 3:00 PM. ¿Para qué procedimiento o valoración deseas la cita?',
        },
      ],
      enabled_tools: ['check_availability', 'book_appointment', 'transfer_to_human'],
      model_config: { provider: 'gemini', model: 'gemini-2.5-flash' },
      out_of_hours_behavior: 'bot_responds',
      human_handoff_trigger: 'Urgencias dentales o quejas de tratamientos',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const prompt = PromptBuilder.build({
      agentName: 'agilizio',
      config: dentalConfig,
      business: dentalClinic,
    });

    expect(prompt).toContain('agilizio');
    expect(prompt).toContain('Clínica Odontológica Sonrisas');
    expect(prompt).toContain('Consultorio 402');
    expect(prompt).toContain('DIRECTRICES ESPECIALIZADAS DEL SECTOR (HEALTH_AND_WELLNESS)');
    expect(prompt).toContain('check_availability');
    expect(prompt).toContain('EJEMPLOS DE RESPUESTA MODELO (FEW-SHOT GUIDANCE)');
    expect(prompt).toContain('¿Tienen cita para mañana a las 3pm?');
    expect(prompt).toContain('Reagendamiento permitido con mínimo 24 horas');
    expect(prompt).toContain('Urgencias dentales o quejas');
  });
});
