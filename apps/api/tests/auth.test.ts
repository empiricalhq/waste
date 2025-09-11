import { test, expect, beforeEach } from 'bun:test';
import { setupTest, type TestContext } from './helpers/test-setup.ts';

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setupTest();
});

test('admin user can login and has correct role', async () => {
  const session = await ctx.auth.loginAs('admin');

  expect(session.user.email).toBe('admin@test.com');
  expect(session.user.appRole).toBe('admin');
  expect(session.cookie).toContain('better-auth.session_token');
});

test('driver user can login and has correct role', async () => {
  const session = await ctx.auth.loginAs('driver');

  expect(session.user.email).toBe('driver@test.com');
  expect(session.user.appRole).toBe('driver');
  expect(session.cookie).toContain('better-auth.session_token');
});

test('citizen user can login and has correct role', async () => {
  const session = await ctx.auth.loginAs('citizen');

  expect(session.user.email).toBe('citizen@test.com');
  expect(session.user.appRole).toBe('citizen');
  expect(session.cookie).toContain('better-auth.session_token');
});

test('login fails with invalid credentials', async () => {
  expect(ctx.auth.login('nonexistent@test.com', 'wrongpassword')).rejects.toThrow();
});

test('multiple login calls reuse existing session', async () => {
  const session1 = await ctx.auth.loginAs('citizen');
  const session2 = await ctx.auth.loginAs('citizen');

  expect(session1).toBe(session2);
});
