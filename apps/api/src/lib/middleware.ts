import { createMiddleware } from 'hono/factory';
import { auth, type Session, type User } from '@/lib/auth.ts';

type AuthEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const authMiddleware = (allowedRoles: string[] = []) => {
  return createMiddleware<AuthEnv>(async (c, next) => {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (allowedRoles.length > 0) {
        const member = await auth.api.getActiveMember({
          headers: c.req.raw.headers,
        });

        if (!member || (member.role !== 'owner' && !allowedRoles.includes(member.role))) {
          return c.json({ error: 'Forbidden' }, 403);
        }
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
