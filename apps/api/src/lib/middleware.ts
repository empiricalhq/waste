import { createMiddleware } from 'hono/factory';
import { auth } from '@/lib/auth';
import type { User } from '@lima-garbage/database';

type Role = User['role'];

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.getSession(c.req.raw);
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', session.user);
  await next();
});

export const roleMiddleware = (requiredRoles: Role[]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');
    if (!user || !user.role || !requiredRoles.includes(user.role as Role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    await next();
  });
};
