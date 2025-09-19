'use server';

import { redirect } from 'next/navigation';
import { cache } from 'react';
import { api } from '@/lib/api';
import type { Session, User } from '@/lib/api-contract';
import type { Role } from './roles';

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: string;
}

export interface AuthContext {
  user: User;
  session: Session;
  member: Member | null;
}

export const getAuth = cache(async (): Promise<AuthContext | null> => {
  try {
    const authContext = await api.auth.getAuthContext();

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

export const getCurrentMember = cache(async (): Promise<Member | null> => {
  return (await getAuth())?.member ?? null;
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  return user;
});
