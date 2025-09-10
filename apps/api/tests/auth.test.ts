import { test, expect } from 'bun:test';
import { login } from './helpers';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_DRIVER_EMAIL, TEST_DRIVER_PASSWORD, TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD } from './config';

test('admin login works', async () => {
  const cookie = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');

  expect(cookie).toBeDefined();
  expect(typeof cookie).toBe('string');
  expect(cookie.length).toBeGreaterThan(0);
});

test('driver login works', async () => {
  const cookie = await login(TEST_DRIVER_EMAIL, TEST_DRIVER_PASSWORD, 'driver');

  expect(cookie).toBeDefined();
  expect(typeof cookie).toBe('string');
  expect(cookie.length).toBeGreaterThan(0);
});

test('citizen login works', async () => {
  const cookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');

  expect(cookie).toBeDefined();
  expect(typeof cookie).toBe('string');
  expect(cookie.length).toBeGreaterThan(0);
});
