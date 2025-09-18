import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { BaseTest } from './base-test';
import { TEST_USERS } from './config';

describe('Authentication', () => {
  const baseTest = new BaseTest();

  beforeEach(async () => {
    await baseTest.setup();
  });

  afterAll(async () => {
    await baseTest.teardown();
  });

  test('admin user can log in with correct role', async () => {
    const session = await baseTest.ctx.auth.loginAs('admin');

    expect(session.user.email).toBe(TEST_USERS.admin.email);
    expect(session.member?.role).toBe('owner');
  });

  test('driver user can log in with correct role', async () => {
    const session = await baseTest.ctx.auth.loginAs('driver');

    expect(session.user.email).toBe(TEST_USERS.driver.email);
    expect(session.member?.role).toBe('driver');
  });

  test('citizen user can log in without membership', async () => {
    const session = await baseTest.ctx.auth.loginAs('citizen');

    expect(session.user.email).toBe(TEST_USERS.citizen.email);
    expect(session.member).toBeNull();
  });

  test('login fails with invalid credentials', async () => {
    await expect(baseTest.ctx.auth.login('invalid@user.com', 'wrongpassword')).rejects.toThrow();
  });
});
