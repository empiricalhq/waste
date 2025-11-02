import { Hono } from 'hono';
import { z } from 'zod';
import { badRequestResponse, errorResponse } from '@/internal/shared/utils/response';
import type { AuthService } from './service';
import type { DatabaseInterface } from '@/internal/shared/database/database';

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export function createAuthHandler(authService: AuthService, db: DatabaseInterface): Hono {
  const auth = new Hono();

  // Intercept reset password to check for same password
  auth.post('/reset-password', async (c) => {
    try {
      const body = await c.req.json();
      const parseResult = resetPasswordSchema.safeParse(body);

      if (!parseResult.success) {
        return badRequestResponse(c, 'VALIDATION_ERROR', parseResult.error.message);
      }

      const { token, newPassword } = parseResult.data;

      // Get user info from verification token
      const verificationResult = await db.query<{ value: string; expiresAt: Date }>(
        `
        SELECT value, "expiresAt"
        FROM verification
        WHERE identifier = $1
        LIMIT 1
        `,
        [`reset-password:${token}`],
      );

      if (verificationResult.length === 0) {
        return badRequestResponse(c, 'INVALID_TOKEN', 'Invalid or expired token');
      }

      const verification = verificationResult[0];

      if (!verification) {
        return badRequestResponse(c, 'INVALID_TOKEN', 'Invalid or expired token');
      }

      // Check if token is expired
      if (new Date() > verification.expiresAt) {
        return badRequestResponse(c, 'EXPIRED_TOKEN', 'Token has expired');
      }

      const userId = verification.value;

      // Get current password hash
      const accountResult = await db.query<{ password: string | null }>(
        `
        SELECT password
        FROM account
        WHERE "userId" = $1 AND password IS NOT NULL
        LIMIT 1
        `,
        [userId],
      );

      if (accountResult.length > 0 && accountResult[0]?.password) {
        const currentPasswordHash = accountResult[0].password;

        // Import bcrypt dynamically
        const bcrypt = await import('bcrypt');

        // Compare new password with current password
        const isSamePassword = await bcrypt.compare(newPassword, currentPasswordHash);

        if (isSamePassword) {
          return badRequestResponse(
            c,
            'SAME_PASSWORD',
            'La nueva contraseña no puede ser la misma que la contraseña actual',
          );
        }
      }

      // Delegate to Better Auth for actual password reset
      return authService.handler(c.req.raw);
    } catch (error) {
      console.error('Error in reset password handler:', error);
      return errorResponse(c, 'Error al restablecer la contraseña', 500);
    }
  });

  // All other routes go to Better Auth
  auth.on(['POST', 'GET'], '/*', (c) => {
    return authService.handler(c.req.raw);
  });

  return auth;
}
