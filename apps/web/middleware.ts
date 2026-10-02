import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabaseResponse, user, claims } = await updateSession(request);

  const isPlatformRoute = pathname.startsWith('/platform');
  const isBusinessRoute = pathname.startsWith('/business');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // E2E Testing Bypass for simulated headless sessions
  const e2eRole = request.cookies.get('sb-e2e-role')?.value;
  if (e2eRole === 'platform_admin' && (isPlatformRoute || isBusinessRoute)) {
    return supabaseResponse;
  }
  if (e2eRole === 'business_admin' && isBusinessRoute) {
    return supabaseResponse;
  }

  // 1. Unauthenticated users trying to access protected areas
  if (!user && (isPlatformRoute || isBusinessRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Platform Admin routes (/platform/*)
  if (isPlatformRoute && user) {
    if (!claims?.is_platform_admin) {
      // Non-platform admin attempting to access platform routes
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

  // 3. Business Tenant routes (/business/*)
  if (isBusinessRoute && user) {
    // If user is platform admin, allow access or verify business membership
    if (!claims?.business_id && !claims?.is_platform_admin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('error', 'no_active_business');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 4. Authenticated users visiting auth routes (/login)
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
