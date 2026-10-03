-- ==============================================================================
-- Script de Inicialización (Seed): Administrador Global de Agilizio
-- ==============================================================================
-- Credenciales:
--   Correo:      admin@agilizio.com
--   Contraseña:  agilizio2026
--   Rol Global:  is_platform_admin = true (public.platform_admins + JWT app_metadata)
--   Membresía:   owner en negocio demo (public.memberships)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@agilizio.com';
  v_password TEXT := 'agilizio2026';
  v_encrypted_pw TEXT;
  v_business_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- 1. Asegurar que exista al menos un Negocio en public.businesses
  INSERT INTO public.businesses (
    id, name, description, status, timezone, business_hours, location, settings
  ) VALUES (
    v_business_id,
    'Restaurante Gourmet Demo',
    'Hamburguesería artesanal y parrilla premium',
    'active',
    'America/Bogota',
    '{"timezone":"America/Bogota","days":{"monday":{"open":"11:30","close":"22:00","closed":false},"tuesday":{"open":"11:30","close":"22:00","closed":false},"wednesday":{"open":"11:30","close":"22:00","closed":false},"thursday":{"open":"11:30","close":"23:00","closed":false},"friday":{"open":"11:30","close":"23:30","closed":false},"saturday":{"open":"12:00","close":"23:30","closed":false},"sunday":{"open":"12:00","close":"21:00","closed":false}}}'::jsonb,
    '{"address":"Calle 93 # 14-20","city":"Bogota","country":"Colombia"}'::jsonb,
    '{"currency":"COP","language":"es"}'::jsonb
  ) ON CONFLICT (id) DO UPDATE
  SET status = 'active';

  RAISE NOTICE '✓ Negocio demo verificado en public.businesses (ID: %)', v_business_id;

  -- 2. Generar hash compatible con Supabase Auth
  v_encrypted_pw := crypt(v_password, gen_salt('bf'));

  -- 3. Verificar o crear el usuario en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated', v_email, v_encrypted_pw, NOW(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'is_platform_admin', true, 'business_id', v_business_id::text),
      jsonb_build_object('name', 'Admin Agilizio', 'is_platform_admin', true),
      NOW(), NOW(), '', '', '', ''
    );

    -- Vincular a auth.identities
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id,
      json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
      'email', v_user_id::text, NOW(), NOW(), NOW()
    );

    RAISE NOTICE '✓ Usuario auth creado: % (ID: %)', v_email, v_user_id;
  ELSE
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'is_platform_admin', true, 'business_id', v_business_id::text),
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('name', 'Admin Agilizio', 'is_platform_admin', true),
        updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE '✓ Contraseña y metadatos actualizados para: % (ID: %)', v_email, v_user_id;
  END IF;

  -- 4. Asignar rol Platform Admin global (public.platform_admins)
  INSERT INTO public.platform_admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RAISE NOTICE '✓ Asignado como platform_admin (acceso global a /platform/*)';

  -- 5. Asignar membresía activa como 'owner' en public.memberships
  INSERT INTO public.memberships (user_id, business_id, role, is_active)
  VALUES (v_user_id, v_business_id, 'owner', true)
  ON CONFLICT (user_id, business_id) DO UPDATE
  SET role = 'owner', is_active = true;
  RAISE NOTICE '✓ Membresía configurada como owner en negocio demo (acceso a /business/*)';

  RAISE NOTICE '=========================================================';
  RAISE NOTICE '¡CONFIGURACIÓN EXITOSA!';
  RAISE NOTICE 'Correo:     admin@agilizio.com';
  RAISE NOTICE 'Contraseña: agilizio2026';
  RAISE NOTICE '=========================================================';

END $$;
