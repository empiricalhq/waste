'use server';

import { requireUser } from '@/features/auth/lib';
import { api } from '@/lib/api';
import type { User } from '@/lib/api-contract';

export async function getDrivers(): Promise<User[]> {
  try {
    await requireUser(['admin', 'supervisor']);
    return await api.admin.getDrivers();
  } catch (_error) {
    return [];
  }
}
