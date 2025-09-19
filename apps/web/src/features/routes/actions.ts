'use server';

import { revalidatePath } from 'next/cache';
import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import type { Route } from '@/lib/api-contract';
import { type CreateRouteSchema, createRouteSchema } from './schemas';

type ActionResult = {
  error?: string;
};
export async function getRoutes(): Promise<Route[]> {
  try {
    await requireUser();

    const auth = await getAuth();
    const userRoles = auth?.user?.role?.split(',') ?? [];

    if (!PROTECTED_ROLES.some((role) => userRoles.includes(role))) {
      throw new Error('Unauthorized');
    }

    return await api.admin.getRoutes();
  } catch (_error) {
    return [];
  }
}

export async function createRoute(data: CreateRouteSchema): Promise<ActionResult> {
  const validatedFields = createRouteSchema.safeParse(data);
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

    await api.admin.createRoute(validatedFields.data);
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Failed to create route.' };
  }

  revalidatePath('/routes');
  return { error: undefined };
}
