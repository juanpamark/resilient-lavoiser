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

  // Determine destination based on claims, user metadata, or role
  let destination = '/platform/dashboard';
  try {
    let isPlatformAdmin =
      Boolean(data.user?.app_metadata?.is_platform_admin) ||
      Boolean(data.user?.user_metadata?.is_platform_admin) ||
      data.user?.email?.toLowerCase() === 'admin@agilizio.com';

    let businessId: string | undefined;

    const payloadBase64 = data.session.access_token.split('.')[1];
    if (payloadBase64) {
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const claims = JSON.parse(decodedJson) as any;
      if (claims.is_platform_admin) {
        isPlatformAdmin = true;
      }
      if (claims.business_id) {
        businessId = claims.business_id;
      }
    }

    if (isPlatformAdmin) {
      destination = '/platform/dashboard';
    } else if (businessId) {
      destination = '/business/dashboard';
    } else {
      // Check if user has an active membership
      const { data: member } = await supabase
        .from('memberships')
        .select('business_id')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (member?.business_id) {
        destination = '/business/dashboard';
      }
    }
  } catch {
    destination = '/platform/dashboard';
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
