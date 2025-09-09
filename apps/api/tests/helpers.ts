import { expect } from 'bun:test';
import { BASE_URL } from './config';
import { auth } from '@/lib/auth.ts';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  console.log(`${options.method || 'GET'} ${endpoint} -> ${response.status}`);
  if (response.status >= 400) {
    console.error('Response:', data);
  }

  return { response, data };
}

export async function login(email: string, password: string, role: string = 'citizen') {
  console.log(`Attempting login for ${role}: ${email}`);

  // first try to create the user (ignore if already exists)
  try {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: `Test ${role}`,
        email,
        password,
      },
    });
    console.log('User creation result:', signUpResult);
  } catch (error) {
    console.log('User might already exist, continuing with login...');
  }

  const signInResult = await auth.api.signInEmail({
    body: { email, password },
    returnHeaders: true,
  });

  console.log('Sign in result:', signInResult);

  const cookie = signInResult.headers.get('set-cookie');
  if (!cookie) {
    throw new Error('No session cookie received');
  }

  return cookie;
}

export function expectValidId(id: any) {
  expect(id).toBeDefined();
  expect(typeof id === 'string' || typeof id === 'number').toBe(true);
}

export function expectValidTimestamp(timestamp: any) {
  expect(timestamp).toBeDefined();
  expect(new Date(timestamp).getTime()).not.toBeNaN();
}
