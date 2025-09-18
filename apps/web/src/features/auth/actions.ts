'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { api } from '@/lib/api';
import { getSession } from './lib';
import { type SignInSchema, type SignUpSchema, signInSchema, signUpSchema } from './schemas';

type ActionResult = {
  error?: string;
};

export async function signIn(data: SignInSchema): Promise<ActionResult> {
  const validatedFields = signInSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields.' };
  }

  try {
    await api.post('/api/auth/sign-in/email', validatedFields.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(data: SignUpSchema) {
  const validatedFields = signUpSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields.' };
  }

  try {
    const session = await getSession();
    const orgId = session?.session.activeOrganizationId;

    if (!orgId) {
      return { error: 'No active organization found to add user to.' };
    }
    await api.post('/api/auth/sign-up/email', {
      ...validatedFields.data,
      data: {
        organizationId: orgId,
        role: validatedFields.data.role,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique constraint')) {
      return { error: 'A user with this email already exists.' };
    }
    return { error: error instanceof Error ? error.message : 'Failed to create user.' };
  }

  revalidatePath('/drivers', 'page');
}

export async function signOut() {
  (await cookies()).delete('better-auth.session_token');
  // biome-ignore lint/suspicious/noEmptyBlockStatements: backend signout is secondary; failure shouldn't block cookie deletion or redirect.
  api.post('/api/auth/sign-out').catch(() => {});
  redirect('/signin');
}
