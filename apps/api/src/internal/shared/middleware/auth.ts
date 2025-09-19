import { createMiddleware } from 'hono/factory';
import type { AuthService } from '@/internal/domains/auth/service';
import type { AuthEnv } from '@/internal/domains/auth/types';
import { forbidden, unauthorized } from '@/internal/shared/utils/response';

export function createAuthMiddleware(authService: AuthService) {
  return function authMiddleware(allowedRoles: string[]) {
    return createMiddleware<AuthEnv>(async (c, next) => {
      const session = await authService.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return unauthorized(c);
      }

      // if no roles required, allow access
      if (allowedRoles.length === 0) {
        c.set('user', session.user);
        c.set('session', session.session);
        return await next();
      }

      // check user role
      const { user, session: sessionData } = session;
      const userRoles = user.role?.split(',') ?? [];

      const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        return forbidden(c);
      }

      c.set('user', user);
      c.set('session', sessionData);
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

    const userRoles = session.user.role?.split(',') ?? [];

    if (!userRoles.includes('citizen')) {
      return forbidden(c, 'This endpoint is for citizens only.');
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  });
}
