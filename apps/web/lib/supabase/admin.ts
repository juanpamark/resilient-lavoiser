import { createClient } from '@supabase/supabase-js';

/**
 * Creates a server-side Supabase client with administrative / service-role capabilities.
 * Bypasses RLS when executing authorized server actions, webhooks, or rendering public digital menus.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtorlzkwuyiqzjjyybbo.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
