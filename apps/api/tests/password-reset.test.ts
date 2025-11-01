import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { BaseTest } from './base-test';
import { TEST_USERS } from './config';
import { HTTP_STATUS } from './config';

describe('Password Reset', () => {
  const baseTest = new BaseTest();

  beforeEach(async () => {
    await baseTest.setup();
  });

  afterAll(async () => {
    await baseTest.teardown();
  });

  test('user can request password reset with valid email', async () => {
    const response = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email: TEST_USERS.citizen.email,
      redirectTo: 'http://localhost:3000/reset-password',
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.data).toHaveProperty('status', true);
    expect(response.data).toHaveProperty('message');
  });

  test('request password reset returns success even for non-existent email', async () => {
    // This is a security feature - don't reveal whether an email exists
    const response = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email: 'nonexistent@example.com',
      redirectTo: 'http://localhost:3000/reset-password',
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.data).toHaveProperty('status', true);
  });

  test('request password reset requires email', async () => {
    const response = await baseTest.ctx.client.post('/auth/request-password-reset', {
      redirectTo: 'http://localhost:3000/reset-password',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  test('request password reset validates email format', async () => {
    const response = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email: 'invalid-email',
      redirectTo: 'http://localhost:3000/reset-password',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  test('user can reset password with valid token', async () => {
    // First, request a password reset to get a token
    const email = TEST_USERS.citizen.email;
    
    await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });

    // Get the verification token from the database
    const verificationResult = await baseTest.ctx.db.query<{ token: string }>(
      'SELECT token FROM verification WHERE identifier = $1 AND type = $2 ORDER BY "createdAt" DESC LIMIT 1',
      [email, 'password-reset'],
    );

    expect(verificationResult.length).toBeGreaterThan(0);
    const token = verificationResult[0].token;

    // Reset password with the token
    const newPassword = 'NewSecurePassword123!';
    const resetResponse = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword,
    });

    expect(resetResponse.status).toBe(HTTP_STATUS.OK);
    expect(resetResponse.data).toHaveProperty('status', true);

    // Verify user can login with new password
    const loginResponse = await baseTest.ctx.client.post('/auth/sign-in/email', {
      email,
      password: newPassword,
    });

    expect(loginResponse.status).toBe(HTTP_STATUS.OK);
  });

  test('reset password fails with invalid token', async () => {
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      token: 'invalid-token',
      newPassword: 'NewPassword123!',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  test('reset password requires token', async () => {
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      newPassword: 'NewPassword123!',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  test('reset password requires new password', async () => {
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      token: 'some-token',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  test('reset password validates minimum password length', async () => {
    // First, get a valid token
    const email = TEST_USERS.citizen.email;
    
    await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });

    const verificationResult = await baseTest.ctx.db.query<{ token: string }>(
      'SELECT token FROM verification WHERE identifier = $1 AND type = $2 ORDER BY "createdAt" DESC LIMIT 1',
      [email, 'password-reset'],
    );

    const token = verificationResult[0].token;

    // Try with a password that's too short
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword: 'short',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
