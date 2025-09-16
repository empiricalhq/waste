import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// route configurations
const CONFIG = {
  publicRoutes: ['/', '/about'],
  authRoutes: ['/signin', '/signup'],
  adminRoutes: ['/dashboard/settings', '/dashboard/users'],
  protectedRoutes: ['/dashboard'],
  apiAuthPrefix: '/api/auth',
  defaultLoginRedirect: '/dashboard',
  defaultAuthRedirect: '/signin',
} as const;

// helper functions
function isPublicRoute(pathname: string): boolean {
  return CONFIG.publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthRoute(pathname: string): boolean {
  return CONFIG.authRoutes.some((route) => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return CONFIG.protectedRoutes.some((route) => pathname.startsWith(route));
}

function isApiAuthRoute(pathname: string): boolean {
  return pathname.startsWith(CONFIG.apiAuthPrefix);
}

function isAdminRoute(pathname: string): boolean {
  return CONFIG.adminRoutes.some((route) => pathname.startsWith(route));
}

async function validateSession(_request: NextRequest): Promise<{
  isValid: boolean;
  user?: any;
}> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token');

  if (!sessionToken?.value) {
    return { isValid: false };
  }

  try {
    const response = await fetch(`${process.env.BETTER_AUTH_URL || 'http://localhost:4000'}/api/auth/get-session`, {
      headers: {
        Cookie: `better-auth.session_token=${sessionToken.value}`,
      },
    });

    if (!response.ok) {
      return { isValid: false };
    }

    const session = await response.json();
    return {
      isValid: true,
      user: session.user,
    };
  } catch (_error) {
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // allow API auth routes to pass through
  if (isApiAuthRoute(pathname)) {
    return NextResponse.next();
  }

  // allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // validate session for protected routes
  const { isValid, user } = await validateSession(request);

  // handle auth routes (signin, signup)
  if (isAuthRoute(pathname)) {
    if (isValid) {
      return NextResponse.redirect(new URL(CONFIG.defaultLoginRedirect, request.url));
    }
    return NextResponse.next();
  }

  // handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!isValid) {
      // redirect unauthenticated users to signin
      const signInUrl = new URL(CONFIG.defaultAuthRedirect, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (isAdminRoute(pathname) && user?.appRole !== 'admin') {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check if user has valid role for dashboard access
    if (pathname.startsWith('/dashboard') && !['admin', 'supervisor'].includes(user?.appRole)) {
      // Redirect drivers or invalid roles to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  }

  // Redirect all other routes to signin if not authenticated
  if (!isValid) {
    return NextResponse.redirect(new URL(CONFIG.defaultAuthRedirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
