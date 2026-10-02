-- ==============================================================================
-- Migration 010: Custom Access Token Hook for Supabase Auth & JWT Enrichment
-- ==============================================================================

-- Function that executes during token minting and session refresh
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  v_user_id uuid;
  v_is_platform_admin boolean := false;
  v_business_id uuid;
  v_role text;
BEGIN
  -- Extract user_id from incoming auth event
  v_user_id := (event->>'user_id')::uuid;
  claims := event->'claims';

  -- 1. Check if the user is a Platform Admin (agency administrator)
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = v_user_id
  ) INTO v_is_platform_admin;

  IF v_is_platform_admin THEN
    claims := jsonb_set(claims, '{is_platform_admin}', 'true'::jsonb);
  ELSE
    claims := jsonb_set(claims, '{is_platform_admin}', 'false'::jsonb);
  END IF;

  -- 2. Lookup active business membership for the user
  SELECT business_id, role
  INTO v_business_id, v_role
  FROM public.memberships
  WHERE user_id = v_user_id
    AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1;

  -- Inject business_id and user_role if tenant membership exists
  IF v_business_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{business_id}', to_jsonb(v_business_id::text));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_role));
  END IF;

  -- Set updated claims into the event and return
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Security hardening: only allow supabase_auth_admin to execute the hook
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated;
