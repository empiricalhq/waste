import { createRouter } from '@/lib/create-app';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

const router = createRouter();

router.use('*', async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

type TruckStatusResponse =
  | { status: 'NEARBY' | 'ON_THE_WAY'; etaMinutes: number }
  | { status: 'NOT_SCHEDULED'; nextCollectionDay: string };

router.get('/status', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const profile = await prisma.citizenProfile.findFirst({
      where: { userId: user.id },
    });

    if (!profile || !profile.lat || !profile.lng) {
      return c.json({
        status: 'NOT_SCHEDULED',
        nextCollectionDay: 'Ubicación no configurada',
      } as TruckStatusResponse);
    }

    // TODO: Implement real truck tracking logic
    // For now, we return mock data
    const isNearby = Math.random() > 0.5;

    if (isNearby) {
      const eta = Math.floor(Math.random() * 10) + 2;
      return c.json({
        status: eta < 5 ? 'NEARBY' : 'ON_THE_WAY',
        etaMinutes: eta,
      } as TruckStatusResponse);
    } else {
      return c.json({
        status: 'NOT_SCHEDULED',
        nextCollectionDay: 'Mañana por la mañana',
      } as TruckStatusResponse);
    }
  } catch (error) {
    console.error('Failed to fetch truck status:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default router;
