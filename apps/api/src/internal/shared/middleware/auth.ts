import { createMiddleware } from 'hono/factory';
import type { AuthService } from '@/internal/domains/auth/service';
import type { AuthEnv } from '@/internal/domains/auth/types';
import { forbidden, unauthorized } from '@/internal/shared/utils/response';

/**
 * Role-based authentication middleware.
 * @param allowedRoles - Empty array requires only valid session, otherwise checks for matching roles
 */
export function createAuthMiddleware(authService: AuthService) {
  return function authMiddleware(allowedRoles: string[]) {
    return createMiddleware<AuthEnv>(async (c, next) => {
      const session = await authService.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return unauthorized(c);
      }

      // skip role check if no roles required
      if (allowedRoles.length === 0) {
        c.set('user', session.user);
        c.set('session', session.session);
        return await next();
      }

      const { user, session: sessionData } = session;

      if (!sessionData.activeOrganizationId) {
        return forbidden(c, 'No active organization');
      }

      const memberRoleResponse = await authService.api.getActiveMemberRole({
        headers: c.req.raw.headers,
      });

      if (!memberRoleResponse) {
        return forbidden(c, 'No organization membership found');
      }

      // memberRoleResponse.role can be string or string[], so we normalize it to an array
      const memberRoles = Array.isArray(memberRoleResponse.role) ? memberRoleResponse.role : [memberRoleResponse.role];

      const hasRequiredRole = allowedRoles.some((role) => memberRoles.includes(role));

      if (!hasRequiredRole) {
        return forbidden(c);
      }

      c.set('user', user);
      c.set('session', sessionData);
      await next();
    });
  };
}

/**
 * Creates middleware that restricts access to citizens only
 * Citizens are defined as users without an active organization
 */
export function createCitizenOnlyMiddleware(authService: AuthService) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const session = await authService.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return unauthorized(c);
    }

    if (session.session.activeOrganizationId) {
      return forbidden(c, 'This endpoint is for citizens only.');
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  });
}
