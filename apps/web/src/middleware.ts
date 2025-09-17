import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from './features/auth/lib';

const AUTH_ROUTES = ['/signin', '/signup'];
const PROTECTED_ROUTE_PREFIX = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const session = await getSession();
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
    const userRole = session.user.appRole;
    if (userRole !== 'admin' && userRole !== 'supervisor') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Prevent supervisors from accessing admin-only settings page
    if (pathname.startsWith('/settings') && userRole !== 'admin') {
      return NextResponse.redirect(new URL(PROTECTED_ROUTE_PREFIX, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
