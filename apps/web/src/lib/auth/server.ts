import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { ApiError } from '@/lib/api/client';
import type { AuthSession, User } from '@/lib/types';

const API_BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:4000';

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token');

  if (!sessionToken?.value) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: {
        Cookie: `better-auth.session_token=${sessionToken.value}`,
      },
      // Add cache control for better performance
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Session expired
      }
      throw new ApiError('Session validation failed', response.status);
    }

    const session: AuthSession = await response.json();

    // Validate session structure
    if (!(session.user?.id && session.session?.token)) {
      throw new ApiError('Invalid session data', 422);
    }

    return session;
  } catch (_error) {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user || null;
});

export const requireAuth = cache(async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/signin');
  }
  return user;
});

export const requireRole = cache(async (allowedRoles: string[]): Promise<User> => {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.appRole)) {
    throw new ApiError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403);
  }

  return user;
});

export const auth = {
  api: {
    getSession,
    getCurrentUser,
    requireAuth,
    requireRole,
  },
};
