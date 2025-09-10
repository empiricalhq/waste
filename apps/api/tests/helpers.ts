import { expect } from 'bun:test';
import { BASE_URL } from './config';
import { cleanDatabase } from './database';

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

export async function cleanTestData(): Promise<void> {
  await cleanDatabase();
}

export async function login(email: string, password: string, role: string = 'citizen') {
  console.log(`🔐 Attempting login for ${role}: ${email}`);

  try {
    const signUpResponse = await apiRequest('/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({
        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email,
        password,
      }),
    });

    if (signUpResponse.response.status === 200 || signUpResponse.response.status === 201) {
      console.log('✅ User created successfully');
    } else if (signUpResponse.response.status === 409 || signUpResponse.response.status === 400) {
      console.log('ℹ️ User might already exist, continuing with login...');
    } else {
      console.warn('⚠️ Unexpected signup response:', signUpResponse.response.status, signUpResponse.data);
    }
  } catch (error: any) {
    console.warn('⚠️ Signup error (continuing with login):', error?.message);
  }

  try {
    const signInResponse = await apiRequest('/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (signInResponse.response.status !== 200) {
      throw new Error(
        `Login failed with status ${signInResponse.response.status}: ${JSON.stringify(signInResponse.data)}`,
      );
    }

    const cookie = signInResponse.response.headers.get('set-cookie');
    if (!cookie) {
      throw new Error('No session cookie received from login');
    }

    console.log('✅ Login successful');
    return cookie;
  } catch (error: any) {
    console.error('Login failed:', error?.message);
    throw new Error(`Login failed for ${email}: ${error?.message}`);
  }
}

export function expectValidId(id: any) {
  expect(id).toBeDefined();
  expect(typeof id === 'string' || typeof id === 'number').toBe(true);
}

export function expectValidTimestamp(timestamp: any) {
  expect(timestamp).toBeDefined();
  expect(new Date(timestamp).getTime()).not.toBeNaN();
}
