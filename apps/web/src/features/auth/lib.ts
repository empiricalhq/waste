'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { Session, User } from '@/db/types';
import { ENV } from '@/lib/env';

export interface AuthSession {
  user: User;
  session: Session;
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const sessionToken = cookies().get('better-auth.session_token')?.value;
  if (!sessionToken) {
    return null;
  }

  try {
    const response = await fetch(`${ENV.API_BASE_URL}/api/auth/get-session`, {
      headers: { Cookie: `better-auth.session_token=${sessionToken}` },
      cache: 'no-store',
    });

    if (response.status === 401) {
      cookies().delete('better-auth.session_token');
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const session = (await response.json()) as AuthSession;
    return session?.user?.id ? session : null;
  } catch (_error) {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

export const requireUser = cache(async (allowedRoles?: User['appRole'][]): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  if (allowedRoles && !allowedRoles.includes(user.appRole)) {
    redirect('/dashboard');
  }

  return user;
});
