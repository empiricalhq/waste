import { Hono } from 'hono';
import { auth, type User, type Session } from '../lib/auth.ts';
import { db } from '../lib/db.ts';

type Variables = {
  user: User;
  session: Session;
};

export const adminRouter = new Hono<{ Variables: Variables }>();

adminRouter.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  if (!['admin', 'supervisor'].includes(session.user.role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

adminRouter.get('/trucks', async (c) => {
  try {
    const result = await db.query(`
      SELECT t.*, tcl.lat, tcl.lng, u.name as driver_name
      FROM truck t
      LEFT JOIN truck_current_location tcl ON t.id = tcl.truck_id
      LEFT JOIN route_assignment ra ON t.id = ra.truck_id AND ra.status = 'active'
      LEFT JOIN "user" u ON ra.driver_id = u.id
      ORDER BY t.created_at DESC
    `);
    return c.json(result.rows);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});

adminRouter.get('/routes', async (c) => {
  try {
    const result = await db.query(`
      SELECT r.*, u.name as creator_name
      FROM route r
      LEFT JOIN "user" u ON r.created_by = u.id
      ORDER BY r.created_at DESC
    `);
    return c.json(result.rows);
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});
