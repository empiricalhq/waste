import { Hono } from 'hono';
import { auth, type User, type Session } from '@/lib/auth';
import { db } from '@/lib/db';

type Variables = {
  user: User;
  session: Session;
};

export const trucksRouter = new Hono<{ Variables: Variables }>();

trucksRouter.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

trucksRouter.get('/status', async (c) => {
  const user = c.get('user');

  try {
    const result = await db.query('SELECT lat, lng FROM citizen_profile WHERE user_id = $1', [user.id]);

    const profile = result.rows[0];
    if (!profile?.lat || !profile?.lng) {
      return c.json({ status: 'NOT_SCHEDULED', message: 'Location not set' });
    }

    // Mock truck status
    const statuses = ['NEARBY', 'ON_THE_WAY', 'NOT_SCHEDULED'];
    const status = statuses[Math.floor(Math.random() * 3)];

    if (status === 'NEARBY') {
      return c.json({ status: 'NEARBY', etaMinutes: 5 });
    }
    if (status === 'ON_THE_WAY') {
      return c.json({ status: 'ON_THE_WAY', etaMinutes: 20 });
    }

    return c.json({ status: 'NOT_SCHEDULED', nextCollectionDay: 'Tomorrow' });
  } catch (error) {
    return c.json({ error: 'Server error' }, 500);
  }
});
