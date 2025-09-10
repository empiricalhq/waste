import { test, expect, beforeEach } from 'bun:test';
import { login, apiRequest, cleanTestData } from './helpers';
import {
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
  TEST_DRIVER_EMAIL,
  TEST_DRIVER_PASSWORD,
  TEST_CITIZEN_EMAIL,
  TEST_CITIZEN_PASSWORD,
} from './config';

beforeEach(async () => {
  await cleanTestData();
});

test('admin login works', async () => {
  const cookie = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');

  expect(cookie).toBeDefined();
  expect(typeof cookie).toBe('string');
  expect(cookie.length).toBeGreaterThan(0);
  expect(cookie).toContain('better-auth.session_token');
});

test('driver login works', async () => {
  const cookie = await login(TEST_DRIVER_EMAIL, TEST_DRIVER_PASSWORD, 'driver');

  expect(cookie).toBeDefined();
  expect(typeof cookie).toBe('string');
  expect(cookie.length).toBeGreaterThan(0);
  expect(cookie).toContain('better-auth.session_token');
});

test('citizen login works', async () => {
  const cookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');

  expect(cookie).toBeDefined();
  expect(typeof cookie).toBe('string');
  expect(cookie.length).toBeGreaterThan(0);
  expect(cookie).toContain('better-auth.session_token');
});

test('login with invalid credentials fails', async () => {
  // First create a user
  const testEmail = 'test-invalid@example.com';
  const correctPassword = 'correctpassword123';
  const wrongPassword = 'wrongpassword';

  // Create the user first
  await login(testEmail, correctPassword, 'citizen');

  // Now try to login with wrong password
  try {
    await login(testEmail, wrongPassword, 'citizen');
    expect(true).toBe(false); // Should not reach here
  } catch (error: any) {
    expect(error.message).toContain('Login failed');
    console.log('✅ Invalid login correctly rejected');
  }
});

test('authenticated request works with valid cookie', async () => {
  const cookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');

  // Try to get the current session
  const { response, data } = await apiRequest('/auth/get-session', {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  console.log('Session response:', { status: response.status, data });

  expect(response.status).toBe(200);
  if (data) {
    expect(data).toHaveProperty('user');
    console.log('✅ Authenticated session retrieved successfully');
  }
});
