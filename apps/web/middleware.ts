import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh / resolve session and user via Supabase SSR
  const { supabaseResponse, user, claims } = await updateSession(request);

  const isPlatformRoute = pathname.startsWith('/platform');
  const isAdminRoute = pathname.startsWith('/admin');
  const isBusinessRoute = pathname.startsWith('/business');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 2. Strict Unauthenticated Redirection for Protected Routes
  if (!user && (isBusinessRoute || isPlatformRoute || isAdminRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    // Purge any legacy preview/e2e cookie
    response.cookies.delete('sb-e2e-role');
    return response;
  }

  // 3. Admin Route Alias (/admin/* -> /platform/*)
  if (isAdminRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    if (claims?.is_platform_admin) {
      redirectUrl.pathname = '/platform/dashboard';
    } else if (claims?.business_id) {
      redirectUrl.pathname = '/business/dashboard';
    } else {
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('error', 'unauthorized_platform_admin');
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Platform Admin Route Protection (/platform/*)
  if (isPlatformRoute && user) {
    if (!claims?.is_platform_admin) {
      const redirectUrl = request.nextUrl.clone();
      if (claims?.business_id) {
        redirectUrl.pathname = '/business/dashboard';
      } else {
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('error', 'unauthorized_platform_admin');
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 5. Business Tenant Route Protection (/business/*)
  if (isBusinessRoute && user) {
    // Validate tenant membership: user must have a business_id or be a platform admin
    if (!claims?.business_id && !claims?.is_platform_admin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('error', 'no_active_business');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 6. Authenticated Users Visiting Auth Routes (/login)
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    if (claims?.is_platform_admin) {
      redirectUrl.pathname = '/platform/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
    if (claims?.business_id) {
      redirectUrl.pathname = '/business/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/business/:path*',
    '/platform/:path*',
    '/admin/:path*',
    '/login',
  ],
};
