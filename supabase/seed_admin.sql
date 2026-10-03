-- ==============================================================================
-- Script de Inicialización (Seed): Administrador Global de Agilizio
-- ==============================================================================
-- Credenciales:
--   Correo:      admin@agilizio.com
--   Contraseña:  agilizio2026
--   Rol Global:  is_platform_admin = true (public.platform_admins)
--   Membresía:   owner en negocio demo (public.memberships)
-- ==============================================================================
-- Instrucciones de ejecución:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/_/sql
-- 2. Abre una nueva pestaña en el "SQL Editor".
-- 3. Pega este contenido completo y pulsa "Run" (o Ctrl/Cmd + Enter).
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
  -- 1. Generar hash Blowfish compatible con el sistema de autenticación de Supabase
  v_encrypted_pw := crypt(v_password, gen_salt('bf'));

  -- 2. Verificar si el usuario ya existe en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- Insertar usuario en auth.users con correo confirmado
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Admin Agilizio"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Insertar en auth.identities para asegurar compatibilidad con GoTrue
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
      'email',
      v_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE '✓ Usuario creado en auth.users: % (ID: %)', v_email, v_user_id;
  ELSE
    -- Si el usuario ya existe, actualizar su contraseña y asegurar confirmación
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE '✓ Contraseña actualizada para usuario existente: % (ID: %)', v_email, v_user_id;
  END IF;

  -- 3. Asignar rol de Administrador de Plataforma Global (public.platform_admins)
  -- Esto activa 'is_platform_admin: true' en el token JWT enriquecido mediante custom_access_token_hook
  INSERT INTO public.platform_admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RAISE NOTICE '✓ Asignado como platform_admin (acceso a /platform/* y superadmin)';

  -- 4. Asignar membresía activa como 'owner' en el negocio inquilino
  IF EXISTS (SELECT 1 FROM public.businesses WHERE id = v_business_id) THEN
    INSERT INTO public.memberships (user_id, business_id, role, is_active)
    VALUES (v_user_id, v_business_id, 'owner', true)
    ON CONFLICT (user_id, business_id) DO UPDATE
    SET role = 'owner', is_active = true;
    RAISE NOTICE '✓ Membresía configurada en negocio demo (ID: %)', v_business_id;
  ELSE
    -- Si no existe el negocio con ID fijo, asignar al primer negocio registrado
    SELECT id INTO v_business_id FROM public.businesses LIMIT 1;
    IF v_business_id IS NOT NULL THEN
      INSERT INTO public.memberships (user_id, business_id, role, is_active)
      VALUES (v_user_id, v_business_id, 'owner', true)
      ON CONFLICT (user_id, business_id) DO UPDATE
      SET role = 'owner', is_active = true;
      RAISE NOTICE '✓ Membresía configurada en primer negocio disponible (ID: %)', v_business_id;
    END IF;
  END IF;

  RAISE NOTICE '=========================================================';
  RAISE NOTICE '¡Listo! Ahora puedes iniciar sesión en /login con:';
  RAISE NOTICE 'Correo:     admin@agilizio.com';
  RAISE NOTICE 'Contraseña: agilizio2026';
  RAISE NOTICE '=========================================================';

END $$;
