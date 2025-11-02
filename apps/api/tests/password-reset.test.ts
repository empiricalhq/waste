import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { BaseTest } from './base-test';
import { HTTP_STATUS, TEST_USERS } from './config';

describe('Password reset', () => {
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
  });

  test('request password reset returns success even for non-existent email', async () => {
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
    expect((response.data as { code: string }).code).toBe('VALIDATION_ERROR');
  });

  test('request password reset validates email format', async () => {
    const response = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email: 'invalid-email',
      redirectTo: 'http://localhost:3000/reset-password',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((response.data as { code: string }).code).toBe('VALIDATION_ERROR');
  });

  test('user can reset password with valid token', async () => {
    const email = TEST_USERS.citizen.email;

    // 1. trigger reset email
    const resetRequestResponse = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(resetRequestResponse.status).toBe(HTTP_STATUS.OK);

    // 2. get token from db (no email mocking yet)
    const verificationResult = await baseTest.ctx.db.query<{ identifier: string }>(
      `
      SELECT identifier
      FROM verification
      WHERE value = (SELECT id FROM "user" WHERE email = $1)
        AND identifier LIKE $2
      ORDER BY "createdAt" DESC
      LIMIT 1
      `,
      [email, 'reset-password:%'],
    );

    expect(verificationResult).toHaveLength(1);
    const identifier = verificationResult[0]?.identifier;
    // biome-ignore lint/performance/useTopLevelRegex: used only once
    expect(identifier).toMatch(/^reset-password:[A-Za-z0-9]+$/);

    const token = identifier?.replace('reset-password:', '');
    expect(token).toBeDefined();

    // 3. reset password using token
    const newPassword = 'NewSecurePassword123!';
    const resetResponse = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword,
    });

    expect(resetResponse.status).toBe(HTTP_STATUS.OK);
    expect(resetResponse.data).toEqual({ status: true });

    // 4. login with new password
    const loginResponse = await baseTest.ctx.client.post('/auth/sign-in/email', {
      email,
      password: newPassword,
    });

    expect(loginResponse.status).toBe(HTTP_STATUS.OK);
    expect((loginResponse.data as { user: { email: string } }).user.email).toBe(email);
    expect((loginResponse.data as { token: string }).token).toBeDefined();
  });

  test('reset password fails with invalid token', async () => {
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      token: 'invalid-token',
      newPassword: 'NewPassword123!',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((response.data as { code: string }).code).toBe('INVALID_TOKEN');
  });

  test('reset password requires token', async () => {
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      newPassword: 'NewPassword123!',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((response.data as { code: string }).code).toBe('INVALID_TOKEN');
  });

  test('reset password requires new password', async () => {
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      token: 'some-token',
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((response.data as { code: string }).code).toBe('VALIDATION_ERROR');
  });

  test('reset password validates minimum password length', async () => {
    const email = TEST_USERS.citizen.email;

    // 1. Request reset email
    const resetRequestResponse = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(resetRequestResponse.status).toBe(HTTP_STATUS.OK);

    // 2. Extract token from database
    const verificationResult = await baseTest.ctx.db.query<{ identifier: string }>(
      `
      SELECT identifier
      FROM verification
      WHERE value = (
        SELECT id FROM "user" WHERE email = $1
      )
      AND identifier LIKE $2
      ORDER BY "createdAt" DESC
      LIMIT 1
      `,
      [email, 'reset-password:%'],
    );

    expect(verificationResult).toHaveLength(1);
    const identifier = verificationResult[0]?.identifier;
    const token = identifier?.replace('reset-password:', '');

    // 3. Attempt reset with a short password
    const invalidPassword = 'short'; // < 8 chars
    const response = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword: invalidPassword,
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.data).toHaveProperty('code', 'PASSWORD_TOO_SHORT');
  });

  test('user can reset password to the same password (no information disclosure)', async () => {
    const email = TEST_USERS.citizen.email;
    const currentPassword = TEST_USERS.citizen.password;

    // 1. Request password reset
    const resetRequestResponse = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(resetRequestResponse.status).toBe(HTTP_STATUS.OK);

    // 2. Extract token from database
    const verificationResult = await baseTest.ctx.db.query<{ identifier: string }>(
      `
      SELECT identifier
      FROM verification
      WHERE value = (SELECT id FROM "user" WHERE email = $1)
        AND identifier LIKE $2
      ORDER BY "createdAt" DESC
      LIMIT 1
      `,
      [email, 'reset-password:%'],
    );

    expect(verificationResult).toHaveLength(1);
    const identifier = verificationResult[0]?.identifier;
    const token = identifier?.replace('reset-password:', '');

    // 3. Reset password to the SAME password
    const resetResponse = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword: currentPassword,
    });

    // Should succeed without error (no information disclosure)
    expect(resetResponse.status).toBe(HTTP_STATUS.OK);
    expect(resetResponse.data).toEqual({ status: true });

    // 4. Verify user can still login with the password
    const loginResponse = await baseTest.ctx.client.post('/auth/sign-in/email', {
      email,
      password: currentPassword,
    });

    expect(loginResponse.status).toBe(HTTP_STATUS.OK);
    expect((loginResponse.data as { user: { email: string } }).user.email).toBe(email);
  });

  test('reset password fails with expired token', async () => {
    const email = TEST_USERS.citizen.email;

    // 1. Request password reset
    const resetRequestResponse = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(resetRequestResponse.status).toBe(HTTP_STATUS.OK);

    // 2. Extract token from database
    const verificationResult = await baseTest.ctx.db.query<{ identifier: string; id: string }>(
      `
      SELECT identifier, id
      FROM verification
      WHERE value = (SELECT id FROM "user" WHERE email = $1)
        AND identifier LIKE $2
      ORDER BY "createdAt" DESC
      LIMIT 1
      `,
      [email, 'reset-password:%'],
    );

    expect(verificationResult).toHaveLength(1);
    const identifier = verificationResult[0]?.identifier;
    const verificationId = verificationResult[0]?.id;
    const token = identifier?.replace('reset-password:', '');

    // 3. Manually expire the token by setting expiresAt to the past
    await baseTest.ctx.db.query(
      `
      UPDATE verification
      SET "expiresAt" = NOW() - INTERVAL '1 hour'
      WHERE id = $1
      `,
      [verificationId],
    );

    // 4. Attempt to reset password with expired token
    const resetResponse = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword: 'NewPassword123!',
    });

    // Should fail with invalid/expired token error
    expect(resetResponse.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((resetResponse.data as { code: string }).code).toBe('INVALID_TOKEN');
  });

  test('token has correct expiration time set', async () => {
    const email = TEST_USERS.citizen.email;

    // 1. Request password reset
    const resetRequestResponse = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(resetRequestResponse.status).toBe(HTTP_STATUS.OK);

    // 2. Extract token and expiration from database
    const verificationResult = await baseTest.ctx.db.query<{
      identifier: string;
      expiresAt: Date;
      createdAt: Date;
    }>(
      `
      SELECT identifier, "expiresAt", "createdAt"
      FROM verification
      WHERE value = (SELECT id FROM "user" WHERE email = $1)
        AND identifier LIKE $2
      ORDER BY "createdAt" DESC
      LIMIT 1
      `,
      [email, 'reset-password:%'],
    );

    expect(verificationResult).toHaveLength(1);
    const verification = verificationResult[0];

    if (!verification) {
      throw new Error('Verification not found');
    }

    // 3. Verify token expiration is set correctly
    // Better Auth default is typically 1 hour (3600000 ms)
    const createdAt = new Date(verification.createdAt);
    const expiresAt = new Date(verification.expiresAt);
    const expirationDurationMs = expiresAt.getTime() - createdAt.getTime();

    // Token should expire in approximately 1 hour (with some tolerance for test execution time)
    // We'll check if it's between 55 minutes and 65 minutes to account for slight variations
    expect(expirationDurationMs).toBeGreaterThan(55 * 60 * 1000); // > 55 minutes
    expect(expirationDurationMs).toBeLessThan(65 * 60 * 1000); // < 65 minutes
  });

  test('token cannot be reused after successful password reset', async () => {
    const email = TEST_USERS.citizen.email;

    // 1. Request password reset
    const resetRequestResponse = await baseTest.ctx.client.post('/auth/request-password-reset', {
      email,
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(resetRequestResponse.status).toBe(HTTP_STATUS.OK);

    // 2. Extract token from database
    const verificationResult = await baseTest.ctx.db.query<{ identifier: string }>(
      `
      SELECT identifier
      FROM verification
      WHERE value = (SELECT id FROM "user" WHERE email = $1)
        AND identifier LIKE $2
      ORDER BY "createdAt" DESC
      LIMIT 1
      `,
      [email, 'reset-password:%'],
    );

    expect(verificationResult).toHaveLength(1);
    const identifier = verificationResult[0]?.identifier;
    const token = identifier?.replace('reset-password:', '');

    // 3. Reset password successfully
    const firstResetResponse = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword: 'FirstNewPassword123!',
    });

    expect(firstResetResponse.status).toBe(HTTP_STATUS.OK);

    // 4. Attempt to reuse the same token
    const secondResetResponse = await baseTest.ctx.client.post('/auth/reset-password', {
      token,
      newPassword: 'SecondNewPassword123!',
    });

    // Should fail - token should be consumed/deleted after first use
    expect(secondResetResponse.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((secondResetResponse.data as { code: string }).code).toBe('INVALID_TOKEN');
  });
});
