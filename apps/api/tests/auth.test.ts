import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { setupTest, type TestContext } from './setup';

describe('Authentication', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  test('admin user can log in and has the correct role', async () => {
    const session = await ctx.auth.loginAs('admin');
    expect(session.user.email).toBe(ctx.users.getUser('admin').email);
    expect(session.member?.role).toBe('owner');
  });

  test('driver user can log in and has the correct role', async () => {
    const session = await ctx.auth.loginAs('driver');
    expect(session.user.email).toBe(ctx.users.getUser('driver').email);
    expect(session.member?.role).toBe('driver');
  });

  test('citizen user can log in and is not a staff member', async () => {
    const session = await ctx.auth.loginAs('citizen');
    expect(session.user.email).toBe(ctx.users.getUser('citizen').email);
    expect(session.member).toBeNull();
  });

  test('login fails with invalid credentials', async () => {
    await expect(ctx.auth.login('nonexistent@user.com', 'wrongpassword')).rejects.toThrow();
  });
});
