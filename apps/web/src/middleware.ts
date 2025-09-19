import { type NextRequest, NextResponse } from 'next/server';
import type { AuthContext, Member } from './features/auth/lib';
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
    const [sessionRes, memberRes] = await Promise.all([
      fetch(`${ENV.API_BASE_URL}/api/auth/get-session`, { headers, cache: 'no-store' }),
      fetch(`${ENV.API_BASE_URL}/api/auth/organization/get-active-member`, { headers, cache: 'no-store' }),
    ]);

    if (!sessionRes.ok) {
      return null;
    }
    const sessionData = await sessionRes.json();

    const memberData = memberRes.ok ? ((await memberRes.json()) as Member) : null;

    return {
      user: sessionData.user,
      session: sessionData.session,
      member: memberData,
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
  const memberRole = auth?.member?.role;

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
    if (!(memberRole && PROTECTED_ROLES.includes(memberRole))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith(SETTINGS_ROUTE_PREFIX) && !SETTINGS_ROLES.includes(memberRole)) {
      return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
