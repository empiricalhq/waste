'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { Session, User } from '@/db/types';
import { api } from '@/lib/api';
import { ENV } from '@/lib/env';

const HTTP_UNAUTHORIZED = 401;

export interface AuthSession {
  user: User;
  session: Session;
}

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'supervisor' | 'driver' | 'owner';
  createdAt: string;
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const sessionToken = (await cookies()).get('better-auth.session_token')?.value;
  if (!sessionToken) {
    return null;
  }

  try {
    const response = await fetch(`${ENV.API_BASE_URL}/api/auth/get-session`, {
      headers: { Cookie: `better-auth.session_token=${sessionToken}` },
      cache: 'no-store',
    });

    if (response.status === HTTP_UNAUTHORIZED) {
      (await cookies()).delete('better-auth.session_token');
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const session = (await response.json()) as AuthSession;
    return session?.user?.id ? session : null;
  } catch {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

export const getCurrentMember = cache(async (): Promise<Member | null> => {
  const session = await getSession();
  if (!session?.session.activeOrganizationId) {
    return null;
  }
  try {
    return await api.get<Member | null>('/api/auth/organization/member/active');
  } catch {
    return null;
  }
});

export const requireUser = cache(async (allowedRoles?: string[]): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const member = await getCurrentMember();
    if (!member || (member.role !== 'owner' && !allowedRoles.includes(member.role))) {
      redirect('/dashboard');
    }
  }

  return user;
});
