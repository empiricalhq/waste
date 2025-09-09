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
    console.error('Error:', data);
  }

  return { response, data };
}

// Helper to get session cookie
export async function login(email: string, password: string, role: string = 'citizen') {
  // First create the user
  await auth.api.signUpEmail({
    body: {
      name: `Test ${role}`,
      email,
      password,
    },
  });

  // Then sign in
  const { headers } = await auth.api.signInEmail({
    body: { email, password },
    returnHeaders: true,
  });

  const cookie = headers.get('set-cookie');
  if (!cookie) {
    throw new Error('No session cookie received');
  }

  return cookie;
}
