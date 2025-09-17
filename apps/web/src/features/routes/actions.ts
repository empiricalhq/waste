'use server';
import type { Route } from '@/db/types';
import { requireUser } from '@/features/auth/lib';
import { api } from '@/lib/api';

export async function getRoutes(): Promise<Route[]> {
  try {
    await requireUser(['admin', 'supervisor']);
    return await api.get<Route[]>('/api/admin/routes');
  } catch (_error) {
    return [];
  }
}
