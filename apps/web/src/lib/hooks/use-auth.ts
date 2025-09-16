'use client';

import { useSession } from '@/lib/auth/client';
import type { User } from '@/lib/types';

export function useAuth() {
  const { data: session, isPending, error } = useSession();

  const user: User | null = session?.user || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.appRole === 'admin';
  const isSupervisor = user?.appRole === 'supervisor';
  const isDriver = user?.appRole === 'driver';
  const isAuthorized = isAdmin || isSupervisor;

  return {
    user,
    session,
    isAuthenticated,
    isAdmin,
    isSupervisor,
    isDriver,
    isAuthorized,
    isPending,
    error,
  };
}
