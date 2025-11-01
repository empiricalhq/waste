'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PROTECTED_ROLES } from '@/features/auth/roles';
import { api } from '@/lib/api';
import { ENV } from '@/lib/env';
import { type SignInSchema, type SignUpSchema, signInSchema, signUpSchema, type RequestPasswordResetSchema, requestPasswordResetSchema, type ResetPasswordSchema, resetPasswordSchema } from './schemas';

type ActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
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
    await api.post('/api/auth/sign-up/email', {
      ...validatedFields.data,
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

export async function requestPasswordReset(data: RequestPasswordResetSchema): Promise<ActionResult> {
  const validatedFields = requestPasswordResetSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Correo electrónico inválido' };
  }

  try {
    const response = await fetch(`${ENV.API_BASE_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: validatedFields.data.email,
        redirectTo: `${ENV.NEXT_PUBLIC_BASE_URL}/reset-password`,
      }),
    });

    if (!response.ok) {
      throw new Error('No se pudo enviar el correo de restablecimiento');
    }

    return { 
      success: true, 
      message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña' 
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Hubo un problema. Inténtalo de nuevo.' };
  }
}

export async function resetPassword(data: ResetPasswordSchema): Promise<ActionResult> {
  const validatedFields = resetPasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Campos inválidos' };
  }

  try {
    const response = await fetch(`${ENV.API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: validatedFields.data.token,
        newPassword: validatedFields.data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'No se pudo restablecer la contraseña');
    }

    return { 
      success: true, 
      message: 'Tu contraseña ha sido restablecida exitosamente' 
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Hubo un problema. Inténtalo de nuevo.' };
  }
}
