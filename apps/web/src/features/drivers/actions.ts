'use server';
import type { User } from '@/db/types';
import { requireUser } from '@/features/auth/lib';
import { api } from '@/lib/api';

export async function getDrivers(): Promise<User[]> {
  try {
    await requireUser(['admin', 'supervisor']);
    return await api.get<User[]>('/api/admin/drivers');
  } catch {
    return [];
  }
}
