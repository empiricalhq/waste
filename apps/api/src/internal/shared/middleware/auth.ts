import { createMiddleware } from 'hono/factory';
import type { AuthService } from '@/internal/domains/auth/service';
import type { AuthEnv, SessionWithOrg } from '@/internal/domains/auth/types';
import type { DatabaseInterface } from '@/internal/shared/database/database';
import { forbidden, unauthorized } from '@/internal/shared/utils/response';

async function validateUserRole(
  db: DatabaseInterface,
  userId: string,
  orgId: string,
  allowedRoles: string[],
): Promise<boolean> {
  const memberResult = await db.query<{ role: string }>(
    'SELECT role FROM member WHERE "userId" = $1 AND "organizationId" = $2',
    [userId, orgId],
  );

  const userRole = memberResult.rows[0]?.role;
  if (!userRole) {
    return false;
  }

  const isOwner = userRole === 'owner';
  const hasRequiredRole = allowedRoles.includes(userRole);

  return isOwner || hasRequiredRole;
}

export function createAuthMiddleware(authService: AuthService, db: DatabaseInterface) {
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

      // check organization membership and role
      const { user, session: sessionData } = session;
      const activeOrgId = (sessionData as SessionWithOrg).activeOrganizationId;

      if (!activeOrgId) {
        return forbidden(c);
      }

      const hasValidRole = await validateUserRole(db, user.id, activeOrgId, allowedRoles);
      if (!hasValidRole) {
        return forbidden(c);
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

    const activeOrgId = (session.session as SessionWithOrg).activeOrganizationId;

    // a "citizen" is a user who does not have an active organization.
    if (activeOrgId) {
      return forbidden(c, 'This endpoint is for citizens only.');
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  });
}
