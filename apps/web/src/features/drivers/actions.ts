'use server';

import { revalidatePath } from 'next/cache';
import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import type { User } from '@/lib/api-contract';
import { type CreateDriverSchema, createDriverSchema, type UpdateDriverSchema, updateDriverSchema } from './schemas';

type ActionResult = {
  error?: string;
};
export async function getDrivers(): Promise<User[]> {
  await requireUser();

  const auth = await getAuth();
  const userRoles = auth?.user?.role?.split(',') ?? [];

  if (!PROTECTED_ROLES.some((role) => userRoles.includes(role))) {
    throw new Error('Unauthorized');
  }

  return await api.admin.getDrivers();
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

export async function updateDriver(data: UpdateDriverSchema): Promise<ActionResult> {
  const validatedFields = updateDriverSchema.safeParse(data);
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

    const { id, name, email, password } = validatedFields.data;
    await api.admin.updateDriver(id, {
      name,
      email,
      ...(password && { password }), // Only include password if provided
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Failed to update driver.' };
  }

  revalidatePath('/drivers');
  return { error: undefined };
}
