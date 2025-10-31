'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import { ENV } from '@/lib/env';
import { type SignInSchema, type SignUpSchema, signInSchema, signUpSchema } from './schemas';

type ActionResult = {
  error?: string;
};

async function performSignInRequest(credentials: SignInSchema): Promise<{ sessionCookie: string }> {
  const signInResponse = await fetch(`${ENV.API_BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!signInResponse.ok) {
    throw new Error('Correo o contraseña inválidos.');
  }

  const sessionCookie = signInResponse.headers.get('Set-Cookie');
  if (!sessionCookie) {
    throw new Error('No se recibió un token de sesión');
  }

  return { sessionCookie };
}

async function validateUserRole(sessionCookie: string): Promise<void> {
  const sessionResponse = await fetch(`${ENV.API_BASE_URL}/api/auth/get-session`, {
    headers: { Cookie: sessionCookie },
  });
  if (!sessionResponse.ok) {
    throw new Error('Oops. Hubo un problema al verificar tu sesión.');
  }
  const session = await sessionResponse.json();
  const userRole = session?.user?.role;

  if (!(userRole && PROTECTED_ROLES.includes(userRole))) {
    throw new Error('No tienes permiso para acceder a esta aplicación.');
  }
}

async function setSessionCookie(sessionCookie: string): Promise<void> {
  const tokenValue = sessionCookie.split(';')[0].split('=')[1];
  (await cookies()).set('better-auth.session_token', tokenValue, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function signIn(data: SignInSchema): Promise<ActionResult> {
  const validatedFields = signInSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Campos inválidos' };
  }

  try {
    const { sessionCookie } = await performSignInRequest(validatedFields.data);
    await validateUserRole(sessionCookie);
    await setSessionCookie(sessionCookie);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Oops. Ha habido un problema. Inténtalo de nuevo.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(data: SignUpSchema) {
  const validatedFields = signUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' };
  }

  try {
    await api.post('/api/admin/users', {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      role: validatedFields.data.role,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique constraint')) {
      return { error: 'Un usuario con este correo ya existe' };
    }
    return { error: error instanceof Error ? error.message : 'No se pudo crear el usuario' };
  }

  revalidatePath('/drivers', 'page');
}

export async function signOut() {
  (await cookies()).delete('better-auth.session_token');
  // biome-ignore lint/suspicious/noEmptyBlockStatements: backend signout is secondary; failure shouldn't block cookie deletion or redirect.
  api.post('/api/auth/sign-out').catch(() => {});
  redirect('/signin');
}
