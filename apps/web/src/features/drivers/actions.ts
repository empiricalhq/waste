'use server';

import { revalidatePath } from 'next/cache';
import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import type { User } from '@/lib/api-contract';
import { type CreateDriverSchema, createDriverSchema } from './schemas';

type ActionResult = {
  error?: string;
};
export async function getDrivers(): Promise<User[]> {
  try {
    await requireUser();

    const auth = await getAuth();
    const userRoles = auth?.user?.role?.split(',') ?? [];

    if (!PROTECTED_ROLES.some((role) => userRoles.includes(role))) {
      throw new Error('Unauthorized');
    }

    return await api.admin.getDrivers();
  } catch (_error) {
    return [];
  }
}

export async function createDriver(data: CreateDriverSchema): Promise<ActionResult> {
  const validatedFields = createDriverSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields.' };
  }

  try {
    await requireUser();

    const auth = await getAuth();
    const userRoles = auth?.user?.role?.split(',') ?? [];

    if (!PROTECTED_ROLES.some((role) => userRoles.includes(role))) {
      throw new Error('Unauthorized');
    }

    const { name, email, password } = validatedFields.data;
    await api.admin.createDriver({ name, email, password });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Failed to create driver.' };
  }

  revalidatePath('/drivers');
  return { error: undefined };
}
