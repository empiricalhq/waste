import { createMiddleware } from 'hono/factory';
import { auth, type User, type Session } from '@/lib/auth.ts';
import type { Role } from '@/lib/validation.ts';

type AuthEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const authMiddleware = (allowedRoles: Role[] = []) => {
  return createMiddleware<AuthEnv>(async (c, next) => {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role as Role)) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      c.set('user', session.user);
      c.set('session', session.session);
      await next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return c.json({ error: 'Authentication failed' }, 401);
    }
  });
};
