'use server';

import { revalidatePath } from 'next/cache';
import { getAuth, requireUser } from '@/features/auth/lib';
import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import { type CreateIssueSchema, createIssueSchema } from './schemas';

type ActionResult = {
  error?: string;
};

export async function createIssue(data: CreateIssueSchema): Promise<ActionResult> {
  const validatedFields = createIssueSchema.safeParse(data);
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
    await api.admin.createIssue(validatedFields.data);
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Failed to create issue.' };
  }

  revalidatePath('/dashboard');
  return { error: undefined };
}
