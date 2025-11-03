'use server';

import { redirect } from 'next/navigation';
import { cache } from 'react';
import { api } from '@/lib/api';
import type { Session, User } from '@/lib/api-contract';

export interface AuthContext {
  user: User & { role?: string };
  session: Session;
}

export const getAuth = cache(async (): Promise<AuthContext | null> => {
  try {
    const authContext = await api.auth.getSession();

    if (authContext && !authContext.session) {
      return null;
    }

    return authContext;
  } catch (_error) {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  return (await getAuth())?.user ?? null;
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  return user;
});
