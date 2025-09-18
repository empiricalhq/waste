'use server';

import { requireUser } from '@/features/auth/lib';
import { api } from '@/lib/api';
import type { Truck } from '@/lib/api-contract';

export async function getTrucks(): Promise<Truck[]> {
  try {
    await requireUser(['admin', 'supervisor']);
    return await api.admin.getTrucks();
  } catch (_error) {
    return [];
  }
}
