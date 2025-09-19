import { type NextRequest, NextResponse } from 'next/server';
import type { AuthContext } from './features/auth/lib';
import { PROTECTED_ROLES, SETTINGS_ROLES } from './features/auth/roles';
import { ENV } from './lib/env';

const AUTH_ROUTES = ['/signin'];
const PROTECTED_ROUTE_PREFIX = '/dashboard';
const SETTINGS_ROUTE_PREFIX = '/settings';

async function getAuthFromRequest(request: NextRequest): Promise<AuthContext | null> {
  const token = request.cookies.get('better-auth.session_token')?.value;
  if (!token) {
    return null;
  }

  const headers = { Cookie: `better-auth.session_token=${token}` };

  try {
    const sessionRes = await fetch(`${ENV.API_BASE_URL}/api/auth/get-session`, { headers, cache: 'no-store' });

    if (!sessionRes.ok) {
      return null;
    }
    const sessionData = await sessionRes.json();

    return {
      user: sessionData.user,
      session: sessionData.session,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const auth = await getAuthFromRequest(request);
  const isAuthenticated = Boolean(auth?.user);
  const userRole = auth?.user?.role;
  const userRoles = userRole?.split(',') ?? [];

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = pathname.startsWith(PROTECTED_ROUTE_PREFIX);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isProtectedRoute && isAuthenticated) {
    const hasAccess = PROTECTED_ROLES.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      const signInUrl = new URL('/signin', request.url);
      const response = NextResponse.redirect(signInUrl);
      response.cookies.delete('better-auth.session_token');
      return response;
    }

    const hasSettingsAccess = SETTINGS_ROLES.some((role) => userRoles.includes(role));
    if (pathname.startsWith(SETTINGS_ROUTE_PREFIX) && !hasSettingsAccess) {
      return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
