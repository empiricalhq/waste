import { createMiddleware } from 'hono/factory';
import type { AuthService } from '@/internal/domains/auth/service';
import type { AuthEnv } from '@/internal/domains/auth/types';
import type { AppRole } from '@/internal/shared/auth/roles';
import { forbidden, unauthorized } from '@/internal/shared/utils/response';

/** Require a session and, when roles are provided, an active organization member role. */
export function createAuthMiddleware(authService: AuthService) {
  return function authMiddleware(allowedRoles: AppRole[]) {
    return createMiddleware<AuthEnv>(async (c, next) => {
      const session = await authService.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return unauthorized(c);
      }

      // An empty role list means any authenticated user may continue.
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

      // Better Auth may return one role or a list of roles.
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

/** Allow authenticated users who do not have an active organization. */
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
