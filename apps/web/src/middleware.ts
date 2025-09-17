import { type NextRequest, NextResponse } from 'next/server';
import { ENV } from './lib/env';

const AUTH_ROUTES = ['/signin'];
const PROTECTED_ROUTE_PREFIX = '/dashboard';

async function getSession(request: NextRequest) {
  const token = request.cookies.get('better-auth.session_token')?.value;
  if (!token) {
    return null;
  }

  const res = await fetch(`${ENV.API_BASE_URL}/api/auth/get-session`, {
    headers: { Cookie: `better-auth.session_token=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function getMemberRole(request: NextRequest) {
  const token = request.cookies.get('better-auth.session_token')?.value;
  if (!token) {
    return null;
  }
  try {
    const res = await fetch(`${ENV.API_BASE_URL}/api/auth/organization/member/active`, {
      headers: { Cookie: `better-auth.session_token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    const member = await res.json();
    return member?.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  const isAuthenticated = Boolean(session?.user);

  // Allow API routes to pass through
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

  if (isProtectedRoute && session?.user) {
    const memberRole = await getMemberRole(request);
    if (!(memberRole && ['admin', 'supervisor', 'owner'].includes(memberRole))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Prevent supervisors from accessing admin-only settings page
    if (pathname.startsWith('/settings') && memberRole !== 'admin' && memberRole !== 'owner') {
      return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
