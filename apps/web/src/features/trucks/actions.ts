'use server';
import type { Truck } from '@/db/types';
import { requireUser } from '@/features/auth/lib';
import { api } from '@/lib/api';

export async function getTrucks(): Promise<Truck[]> {
  try {
    await requireUser(['admin', 'supervisor']);
    return await api.get<Truck[]>('/api/admin/trucks');
  } catch {
    return [];
  }
}
