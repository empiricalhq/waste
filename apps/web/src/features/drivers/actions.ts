'use server';

import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import type { User } from '@/lib/api-contract';

export async function getDrivers(): Promise<User[]> {
  try {
    await requireUser();

    const auth = await getAuth();
    const userRole = auth?.member?.role;

    if (!(userRole && PROTECTED_ROLES.includes(userRole))) {
      throw new Error('Unauthorized');
    }

    return await api.admin.getDrivers();
  } catch (_error) {
    return [];
  }
}
