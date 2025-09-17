'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { api } from '@/lib/api';
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
    await api.post('/api/auth/signin/email', validatedFields.data);
  } catch (error: any) {
    return { error: error.message || 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(data: SignUpSchema): Promise<ActionResult> {
  const validatedFields = signUpSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields.' };
  }

  try {
    await api.post('/api/auth/signup/email', validatedFields.data);
  } catch (error: any) {
    return { error: error.message || 'Failed to create user.' };
  }

  revalidatePath('/drivers', 'page');
  redirect('/dashboard');
}

export async function signOut() {
  (await cookies()).delete('better-auth.session_token');
  api.post('/api/auth/signout').catch((_err) => {});
  redirect('/signin');
}
