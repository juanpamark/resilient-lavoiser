'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import type { CustomJwtPayload } from '@platform/core';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirect') as string) || '';

  if (!email || !password) {
    redirect('/login?error=missing_credentials');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    redirect(`/login?error=${encodeURIComponent(error?.message || 'invalid_login')}`);
  }

  // Parse claims from JWT to decide appropriate destination
  let destination = '/business/dashboard';
  try {
    const payloadBase64 = data.session.access_token.split('.')[1];
    if (payloadBase64) {
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const claims = JSON.parse(decodedJson) as CustomJwtPayload;
      if (claims.is_platform_admin) {
        destination = '/platform/dashboard';
      } else if (claims.business_id) {
        destination = '/business/dashboard';
      }
    }
  } catch {
    destination = '/business/dashboard';
  }

  if (redirectTo && redirectTo.startsWith('/')) {
    destination = redirectTo;
  }

  redirect(destination);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
