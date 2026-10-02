-- ==============================================================================
-- Seed Data: Demo Business, AI Agent, Channel, Products & Sample Conversation
-- ==============================================================================

DO $$
DECLARE
  v_business_id UUID := '00000000-0000-0000-0000-000000000001';
  v_agent_id UUID := '00000000-0000-0000-0000-000000000002';
  v_customer_id UUID := '00000000-0000-0000-0000-000000000003';
  v_conv_id UUID := '00000000-0000-0000-0000-000000000004';
  v_prod_burg1 UUID := '00000000-0000-0000-0000-000000000010';
  v_prod_burg2 UUID := '00000000-0000-0000-0000-000000000011';
  v_prod_fries UUID := '00000000-0000-0000-0000-000000000012';
  v_prod_drink UUID := '00000000-0000-0000-0000-000000000013';
BEGIN

  -- 1. Create Demo Business
  INSERT INTO public.businesses (id, name, description, status, timezone, business_hours, location, settings)
  VALUES (
    v_business_id,
    'Restaurante Gourmet Demo',
    'Hamburguesería artesanal y parrilla premium',
    'active',
    'America/Bogota',
    '{
      "timezone": "America/Bogota",
      "days": {
        "monday": {"open": "11:30", "close": "22:00", "closed": false},
        "tuesday": {"open": "11:30", "close": "22:00", "closed": false},
        "wednesday": {"open": "11:30", "close": "22:00", "closed": false},
        "thursday": {"open": "11:30", "close": "23:00", "closed": false},
        "friday": {"open": "11:30", "close": "23:30", "closed": false},
        "saturday": {"open": "12:00", "close": "23:30", "closed": false},
        "sunday": {"open": "12:00", "close": "21:00", "closed": false}
      }
    }'::jsonb,
    '{"address": "Calle 93 # 14-20", "city": "Bogota", "country": "Colombia"}'::jsonb,
    '{"currency": "COP", "language": "es"}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create AI Agent
  INSERT INTO public.agents (id, business_id, name, status)
  VALUES (
    v_agent_id,
    v_business_id,
    'Asistente de Pedidos Gourmet',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Create Agent Configuration (Modular Prompt)
  INSERT INTO public.agent_configs (
    agent_id,
    version,
    system_instructions,
    personality,
    business_context,
    policies,
    enabled_tools,
    model_config,
    out_of_hours_behavior,
    human_handoff_trigger,
    is_active
  )
  VALUES (
    v_agent_id,
    1,
    'Eres el asistente virtual oficial de Restaurante Gourmet Demo. Tu objetivo es brindar una atención cálida y eficiente por WhatsApp, responder dudas sobre el menú y guiar a los clientes en la toma de pedidos.',
    '{"tone": "amable, gourmet y profesional", "language": "es-CO"}'::jsonb,
    '{
      "overview": "Especialistas en hamburguesas de carne madurada con pan brioche artesanal.",
      "faq": [
        {"question": "¿Hacen domicilios?", "answer": "Sí, despachamos en un radio de 5km con tiempo promedio de 35 a 45 minutos."},
        {"question": "¿Tienen opciones vegetarianas?", "answer": "Sí, disponemos de medallón de lenteja y champiñones portobello."}
      ]
    }'::jsonb,
    '{
      "return_policy": "Si tu pedido no llega en condiciones óptimas, te lo reponemos sin costo.",
      "cancellation_policy": "Cancelaciones permitidas dentro de los primeros 5 minutos de haber confirmado la orden."
    }'::jsonb,
    '["search_products", "get_product_details", "get_business_hours", "calculate_order", "create_order", "transfer_to_human"]'::jsonb,
    '{"provider": "gemini", "model": "gemini-2.0-flash", "temperature": 0.7, "maxOutputTokens": 2048}'::jsonb,
    'bot_responds',
    'Solicitud explícita de hablar con un humano o reclamo no solucionado',
    true
  )
  ON CONFLICT (agent_id, version) DO NOTHING;

  -- 4. Create Channel Connection (Meta WhatsApp Embedded Signup format)
  INSERT INTO public.channel_connections (
    business_id,
    channel_type,
    channel_account_id,
    waba_id,
    phone_number,
    access_token_encrypted,
    webhook_verify_token,
    is_active,
    onboarding_status,
    billing_type,
    config
  )
  VALUES (
    v_business_id,
    'whatsapp',
    '105948372615243', -- Test Phone Number ID from Meta Cloud API
    '982736451029384', -- Test WABA ID
    '+573001234567',
    'enc_v1_dGVzdF9tZXRhX2FjY2Vzc190b2tlbg==',
    'token_verificacion_segura_demo_12345',
    true,
    'connected',
    'client_direct_meta',
    '{"display_name": "Gourmet Demo WA", "quality_rating": "GREEN"}'::jsonb
  )
  ON CONFLICT (channel_type, channel_account_id) DO NOTHING;

  -- 5. Create Sample Products
  INSERT INTO public.products (id, business_id, name, description, price, category, is_available, is_active)
  VALUES
    (v_prod_burg1, v_business_id, 'Hamburguesa Clásica Artesanal', 'Carne angus 150g, queso cheddar madurado, lechuga, tomate y salsa especial en pan brioche.', 24900.00, 'Hamburguesas', true, true),
    (v_prod_burg2, v_business_id, 'Hamburguesa Doble Trufada', 'Doble carne angus 300g, doble queso gouda, tocineta ahumada y mayonesa de trufa negra.', 35900.00, 'Hamburguesas', true, true),
    (v_prod_fries, v_business_id, 'Papas Rústicas con Romero', 'Papas cortadas a mano con sal marina, romero fresco y alioli de ajo asado.', 9900.00, 'Acompañamientos', true, true),
    (v_prod_drink, v_business_id, 'Limonada de Coco y Menta', 'Bebida refrescante natural preparada con leche de coco y menta fresca.', 8500.00, 'Bebidas', true, true)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Create Demo Customer
  INSERT INTO public.customers (id, business_id, external_id, channel_type, display_name, phone)
  VALUES (
    v_customer_id,
    v_business_id,
    '+573109876543',
    'whatsapp',
    'Carlos Mendoza',
    '+573109876543'
  )
  ON CONFLICT (business_id, channel_type, external_id) DO NOTHING;

  -- 7. Create Demo Conversation
  INSERT INTO public.conversations (id, business_id, agent_id, customer_id, channel_type, status)
  VALUES (
    v_conv_id,
    v_business_id,
    v_agent_id,
    v_customer_id,
    'whatsapp',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 8. Create Demo Initial Messages
  INSERT INTO public.messages (conversation_id, business_id, role, content_type, content, model_used)
  VALUES
    (v_conv_id, v_business_id, 'user', 'text', 'Hola! Qué hamburguesas tienen disponibles?', NULL),
    (v_conv_id, v_business_id, 'assistant', 'text', '¡Hola Carlos! Qué gusto saludarte en Restaurante Gourmet Demo 🍔. Nuestras favoritas son la Hamburguesa Clásica Artesanal ($24.900) y la Doble Trufada ($35.900). ¿Te gustaría ordenar alguna o ver las bebidas y acompañamientos?', 'gemini-2.0-flash')
  ON CONFLICT DO NOTHING;

END $$;
