'use server';

import { requireUser } from '@/features/auth/lib';
import { api } from '@/lib/api';
import type { Route } from '@/lib/api-contract';

export async function getRoutes(): Promise<Route[]> {
  try {
    await requireUser(['admin', 'supervisor']);
    return await api.admin.getRoutes();
  } catch (_error) {
    return [];
  }
}
