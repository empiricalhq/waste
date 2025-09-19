'use server';

import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import type { Truck } from '@/lib/api-contract';

export async function getTrucks(): Promise<Truck[]> {
  try {
    await requireUser();

    const auth = await getAuth();
    const userRoles = auth?.user?.role?.split(',') ?? [];

    if (!PROTECTED_ROLES.some((role) => userRoles.includes(role))) {
      throw new Error('Unauthorized');
    }

    return await api.admin.getTrucks();
  } catch (_error) {
    return [];
  }
}
