-- ==============================================================================
-- Script de Configuración: Restaurante Santa Cruz (Pitch & Demo Comercial)
-- ==============================================================================
-- Este script configura la empresa "Restaurante Santa Cruz", su agente agilizio
-- y su menú gastronómico real para presentar la propuesta comercial de sitio web
-- y agente inteligente por WhatsApp.
-- ==============================================================================

DO $$
DECLARE
  v_business_id UUID := '00000000-0000-0000-0000-000000000001';
  v_agent_id UUID;
BEGIN
  -- 1. Actualizar o asegurar los datos del negocio Restaurante Santa Cruz
  INSERT INTO public.businesses (
    id,
    name,
    slug,
    description,
    status,
    timezone,
    business_hours,
    location,
    settings
  ) VALUES (
    v_business_id,
    'Restaurante Santa Cruz',
    'restaurante-santa-cruz',
    'Especialistas en carnes a la brasa, cortes madurados, gastronomía típica y eventos familiares.',
    'active',
    'America/Bogota',
    '{
      "timezone": "America/Bogota",
      "days": {
        "monday": {"open": "11:30", "close": "20:30", "closed": false},
        "tuesday": {"open": "11:30", "close": "20:30", "closed": false},
        "wednesday": {"open": "11:30", "close": "20:30", "closed": false},
        "thursday": {"open": "11:30", "close": "21:00", "closed": false},
        "friday": {"open": "11:30", "close": "22:00", "closed": false},
        "saturday": {"open": "11:00", "close": "22:00", "closed": false},
        "sunday": {"open": "11:00", "close": "20:30", "closed": false}
      }
    }'::jsonb,
    '{
      "address": "Sede Campestre Km 4 Vía Principal",
      "city": "Santa Cruz",
      "country": "Colombia",
      "phone": "+57 300 123 4567"
    }'::jsonb,
    '{
      "currency": "COP",
      "language": "es-CO",
      "industry": "food_and_beverage"
    }'::jsonb
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    business_hours = EXCLUDED.business_hours,
    location = EXCLUDED.location,
    settings = EXCLUDED.settings,
    status = 'active';

  RAISE NOTICE '✓ Negocio actualizado a: Restaurante Santa Cruz';

  -- 2. Limpiar productos demo antiguos para este negocio y poblar la carta de Santa Cruz
  DELETE FROM public.products WHERE business_id = v_business_id;

  INSERT INTO public.products (
    business_id, name, sku, category, price, description, is_active, metadata
  ) VALUES
    (
      v_business_id,
      'Parrillada Especial Santa Cruz',
      'CAR-PAR-01',
      'Parrilla & Carnes',
      75000,
      'Corte de punta de anca, pechuga a la brasa, costilla de cerdo, chorizo artesanal, arepa de choclo y papas criollas con chimichurri de la casa.',
      true,
      '{"prep_time": "25 min", "recommended": true}'::jsonb
    ),
    (
      v_business_id,
      'Churrasco a la Brasa 350g',
      'CAR-CHU-02',
      'Parrilla & Carnes',
      42000,
      'Tierno corte de chatas maduradas al carbón, servido con yuca al vapor, ensalada fresca campesina y chimichurri.',
      true,
      '{"prep_time": "20 min"}'::jsonb
    ),
    (
      v_business_id,
      'Bandeja Típica Santa Cruz',
      'TIP-BAN-03',
      'Platos Típicos',
      36000,
      'Fríjoles tradicionales campesinos, arroz blanco, carne molida en paila, chicharrón crocante 100% carnudo, huevo frito, tajada de maduro y aguacate.',
      true,
      '{"prep_time": "15 min"}'::jsonb
    ),
    (
      v_business_id,
      'Costillas BBQ Ahumadas',
      'CAR-COS-04',
      'Parrilla & Carnes',
      38500,
      '500g de costillas de cerdo tiernas bañadas en salsa BBQ artesanal con panela y especias, acompañadas de papas a la francesa.',
      true,
      '{"prep_time": "20 min"}'::jsonb
    ),
    (
      v_business_id,
      'Cazuela de Mariscos Tradicional',
      'PES-CAZ-05',
      'Pescados & Mariscos',
      48000,
      'Combinación de camarones, calamares y filete de pescado en suave crema de coco y cilantro fresco, servida con arroz de coco y patacones.',
      true,
      '{"prep_time": "25 min"}'::jsonb
    ),
    (
      v_business_id,
      'Picada Campesina Familiar (4 personas)',
      'COM-PIC-06',
      'Para Compartir',
      95000,
      'Generosa picada con lomo de cerdo, carne de res, chicharrón, morcilla, plátano maduro con queso, arepitas y ají casero.',
      true,
      '{"prep_time": "30 min"}'::jsonb
    ),
    (
      v_business_id,
      'Jugo Natural en Fruta Fresca',
      'BEB-JUG-07',
      'Bebidas',
      7500,
      'Jugo preparado con fruta 100% natural (Mango, Maracuyá, Lulo, Mora o Guanábana), en agua o leche.',
      true,
      '{"prep_time": "5 min"}'::jsonb
    ),
    (
      v_business_id,
      'Limonada de Coco Frappé',
      'BEB-LIM-08',
      'Bebidas',
      9500,
      'Cremosa limonada con leche de coco de la costa, hierbabuena y hielo frappé.',
      true,
      '{"prep_time": "5 min"}'::jsonb
    );

  RAISE NOTICE '✓ 8 platos y bebidas de la carta de Restaurante Santa Cruz insertados en public.products';

  -- 3. Crear o actualizar el agente oficial de Restaurante Santa Cruz
  SELECT id INTO v_agent_id FROM public.agents WHERE business_id = v_business_id LIMIT 1;

  IF v_agent_id IS NULL THEN
    v_agent_id := gen_random_uuid();
    INSERT INTO public.agents (id, business_id, name, status)
    VALUES (v_agent_id, v_business_id, 'agilizio — Restaurante Santa Cruz', 'active');
  ELSE
    UPDATE public.agents
    SET name = 'agilizio — Restaurante Santa Cruz', status = 'active'
    WHERE id = v_agent_id;
  END IF;

  -- 4. Insertar o actualizar la versión 1 de configuración del agente en public.agent_configs
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
  ) VALUES (
    v_agent_id,
    1,
    'Eres "agilizio", el asistente virtual y anfitrión oficial de Restaurante Santa Cruz por WhatsApp. Tu misión es brindar una cálida bienvenida a los comensales, detallar los platos de nuestra parrilla campesina, cortes madurados a la brasa y comida típica colombiana, gestionar reservas de mesas para eventos familiares o fines de semana, tomar pedidos a domicilio con exactitud matemática y responder con orgullo sobre nuestra sazón campestre.',
    '{"tone": "amable, cálido, anfitrión y profesional", "language": "es-CO"}'::jsonb,
    '{
      "overview": "Restaurante Santa Cruz ofrece las mejores carnes al carbón, cortes madurados y platos típicos campestres, con servicio a la mesa, zona verde infantil y domicilios.",
      "faq": [
        {
          "q": "¿Cómo puedo reservar una mesa para el fin de semana o un evento familiar?",
          "a": "¡Con gusto podemos agendar tu reserva! Indícanos la fecha, hora de llegada y cuántas personas te acompañarán. Para grupos de más de 8 personas recomendamos reservar con al menos 24 horas de antelación."
        },
        {
          "q": "¿Tienen servicio a domicilio y en qué horarios?",
          "a": "Sí, despachamos domicilios todos los días de 11:30 AM a 8:30 PM. El tiempo estimado de entrega es de 35 a 45 minutos."
        },
        {
          "q": "¿Qué medios de pago reciben?",
          "a": "Aceptamos pagos por transferencia Nequi, Daviplata, Bancolombia, pago contraentrega en efectivo y datáfono para tarjetas débito o crédito."
        },
        {
          "q": "¿Tienen parqueadero y zona campestre o para niños?",
          "a": "Sí, contamos con amplio parqueadero privado y vigilado sin costo para nuestros comensales, amplias zonas verdes y juegos infantiles."
        }
      ]
    }'::jsonb,
    '{
      "cancellation_policy": "Para reservas de mesa, puedes reagendar o cancelar sin costo hasta 2 horas antes de la hora acordada.",
      "return_policy": "En domicilios garantizamos la calidad y temperatura de nuestros platos. Ante cualquier inconveniente en la entrega, ofrecemos reposición inmediata sin costo."
    }'::jsonb,
    '["search_products", "calculate_order", "create_order", "check_availability", "book_appointment", "get_business_information", "transfer_to_human"]'::jsonb,
    '{"provider": "gemini", "model": "gemini-3.5-flash", "temperature": 0.7}'::jsonb,
    'bot_responds',
    'Solicitud explícita de hablar con un encargado o quejas complejas',
    true
  ) ON CONFLICT (agent_id, version) DO UPDATE SET
    system_instructions = EXCLUDED.system_instructions,
    personality = EXCLUDED.personality,
    business_context = EXCLUDED.business_context,
    policies = EXCLUDED.policies,
    enabled_tools = EXCLUDED.enabled_tools,
    model_config = EXCLUDED.model_config,
    is_active = true;

  RAISE NOTICE '✓ Configuración del agente de Restaurante Santa Cruz guardada exitosamente en public.agent_configs';

END $$;
