import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { CustomJwtPayload } from '@platform/core';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as CookieOptions)
        );
      },
    },
  });

  // IMPORTANT: Use getUser() instead of getSession() as recommended by Supabase Auth security guidelines
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, inspect access token payload to read custom claims
  let claims: CustomJwtPayload | null = null;
  if (user) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      try {
        const payloadBase64 = sessionData.session.access_token.split('.')[1];
        if (payloadBase64) {
          const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
          claims = JSON.parse(decodedJson) as CustomJwtPayload;
        }
      } catch {
        claims = null;
      }
    }
  }

  return { supabaseResponse, user, claims };
}
