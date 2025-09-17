import { createMiddleware } from 'hono/factory';
import type { AuthService, AuthSession, AuthUser } from '@/internal/services/auth';
import { forbidden, unauthorized } from '@/internal/utils/response';

type AuthEnv = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

export function createAuthMiddleware(authService: AuthService) {
  return function authMiddleware(allowedRoles: string[]) {
    return createMiddleware<AuthEnv>(async (c, next) => {
      const session = await authService.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return unauthorized(c);
      }

      if (allowedRoles.length > 0) {
        const userWithRole = session.user as AuthUser & { role?: string };

        if (!userWithRole.role || (userWithRole.role !== 'owner' && !allowedRoles.includes(userWithRole.role))) {
          return forbidden(c);
        }
      }

      c.set('user', session.user);
      c.set('session', session.session);
      await next();
    });
  };
}

export function createCitizenOnlyMiddleware(authService: AuthService) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const session = await authService.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return unauthorized(c);
    }

    const userWithRole = session.user as AuthUser & { role?: string };

    if (userWithRole.role) {
      return forbidden(c, 'This endpoint is for citizens only.');
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  });
}
