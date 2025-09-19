'use server';

import { revalidatePath } from 'next/cache';
import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import type { User } from '@/lib/api-contract';
import {
  type CreateSupervisorSchema,
  createSupervisorSchema,
  type UpdateSupervisorSchema,
  updateSupervisorSchema,
} from './schemas';

type ActionResult = {
  error?: string;
};

export async function getSupervisors(): Promise<User[]> {
  try {
    await requireUser();
    const auth = await getAuth();
    const userRoles = auth?.user?.role?.split(',') ?? [];
    if (!PROTECTED_ROLES.some((role) => userRoles.includes(role))) {
      throw new Error('Unauthorized');
    }
    return await api.admin.getSupervisors();
  } catch (_error) {
    return [];
  }
}

export async function createSupervisor(data: CreateSupervisorSchema): Promise<ActionResult> {
  const validatedFields = createSupervisorSchema.safeParse(data);
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
    await api.admin.createSupervisor({ name, email, password });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Failed to create supervisor.' };
  }

  revalidatePath('/supervisors');
  return { error: undefined };
}

export async function updateSupervisor(data: UpdateSupervisorSchema): Promise<ActionResult> {
  const validatedFields = updateSupervisorSchema.safeParse(data);
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
    await api.admin.updateSupervisor(id, {
      name,
      email,
      ...(password && { password }),
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Failed to update supervisor.' };
  }

  revalidatePath('/supervisors');
  return { error: undefined };
}
