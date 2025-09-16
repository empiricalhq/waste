'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import type { User } from '@/lib/types';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await auth.api.getSession();
    if (!session?.user) {
      return null;
    }

    const user = session.user;
    if (!['admin', 'supervisor'].includes(user.appRole)) {
      return null;
    }

    return user;
  } catch (_error) {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/signin');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.appRole)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}
