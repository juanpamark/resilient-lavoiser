import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabaseResponse, user, claims } = await updateSession(request);

  const isPlatformRoute = pathname.startsWith('/platform');
  const isAdminRoute = pathname.startsWith('/admin');
  const isBusinessRoute = pathname.startsWith('/business');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Preview Mode / E2E Testing Bypass
  const previewParam = request.nextUrl.searchParams.get('preview');
  const e2eCookie = request.cookies.get('sb-e2e-role')?.value;
  const activeRole = previewParam || e2eCookie;

  if (activeRole === 'platform' || activeRole === 'platform_admin') {
    const res = NextResponse.next({ request });
    if (previewParam) {
      res.cookies.set('sb-e2e-role', 'platform_admin', { path: '/' });
    }
    return res;
  }

  if (activeRole === 'business' || activeRole === 'business_admin') {
    if (isBusinessRoute || pathname === '/') {
      const res = NextResponse.next({ request });
      if (previewParam) {
        res.cookies.set('sb-e2e-role', 'business_admin', { path: '/' });
      }
      return res;
    }
  }

  // 1. Unauthenticated users trying to access protected areas (/platform/*, /business/*, /admin/*)
  if (!user && (isPlatformRoute || isBusinessRoute || isAdminRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Admin alias route handling (/admin/* -> /platform/*)
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

  // 3. Platform Admin routes (/platform/*)
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
