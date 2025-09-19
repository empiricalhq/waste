'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { api } from '@/lib/api';
import { ENV } from '@/lib/env';
import type { Member } from './lib';
import { PROTECTED_ROLES } from './roles';
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
    const signInResponse = await fetch(`${ENV.API_BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    if (!signInResponse.ok) {
      return { error: 'Invalid email or password.' };
    }

    const tempCookie = signInResponse.headers.get('Set-Cookie');
    if (!tempCookie) {
      return { error: 'Authentication failed: no session token received.' };
    }

    const orgsResponse = await fetch(`${ENV.API_BASE_URL}/api/auth/organization/list`, {
      headers: { Cookie: tempCookie },
    });
    const orgs = await orgsResponse.json();
    if (!orgs || orgs.length === 0) {
      return { error: 'You are not a member of any organization.' };
    }
    const orgId = orgs[0].id;

    const setActiveResponse = await fetch(`${ENV.API_BASE_URL}/api/auth/organization/set-active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: tempCookie },
      body: JSON.stringify({ organizationId: orgId }),
    });

    if (!setActiveResponse.ok) {
      return { error: 'Failed to set active organization.' };
    }

    const finalCookie = setActiveResponse.headers.get('Set-Cookie') || tempCookie;

    const memberResponse = await fetch(`${ENV.API_BASE_URL}/api/auth/organization/get-active-member`, {
      headers: { Cookie: finalCookie },
    });
    if (!memberResponse.ok) {
      return { error: 'Could not retrieve user role.' };
    }
    const member = (await memberResponse.json()) as Member;

    if (!PROTECTED_ROLES.includes(member.role)) {
      return { error: 'You do not have permission to access this application.' };
    }

    const tokenValue = finalCookie.split(';')[0].split('=')[1];
    (await cookies()).set('better-auth.session_token', tokenValue, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } catch (_error) {
    return { error: 'An unexpected error occurred. Please try again.' };
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
    const auth = (await import('./lib')).getAuth();
    const session = await auth;
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
