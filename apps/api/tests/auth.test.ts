import { test, expect, beforeEach, beforeAll } from 'bun:test';
import { TEST_USERS } from './config.ts';
import { auth } from './auth';
import { setup } from './setup.ts';

beforeEach(async () => {
  await setup();
});

test('can create and login admin user', async () => {
  const session = await auth.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

  expect(session.user.email).toBe(TEST_USERS.admin.email);
  expect(session.user.appRole).toBe('admin');
  expect(session.cookie).toContain('better-auth.session_token');
});

test('can create and login driver user', async () => {
  const session = await auth.login(TEST_USERS.driver.email, TEST_USERS.driver.password);

  expect(session.user.email).toBe(TEST_USERS.driver.email);
  expect(session.user.appRole).toBe('driver');
});

test('can create and login citizen user', async () => {
  const session = await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);

  expect(session.user.email).toBe(TEST_USERS.citizen.email);
  expect(session.user.appRole).toBe('citizen');
});

test('login fails with wrong password', async () => {
  await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);
  auth.clear();

  expect(auth.login(TEST_USERS.citizen.email, 'wrongpassword')).rejects.toThrow('Login failed');
});

test('reuses existing session on multiple login calls', async () => {
  const session1 = await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);
  const session2 = await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);

  expect(session1).toBe(session2);
});
