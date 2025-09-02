import { createRouter } from '@/lib/create-app';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

const router = createRouter();

// Admin auth middleware
router.use('*', async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin' && session.user.role !== 'supervisor') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

// Get all trucks
router.get('/trucks', async (c) => {
  try {
    const trucks = await prisma.truck.findMany({
      include: {
        currentLocation: true,
        routeAssignments: {
          where: {
            status: 'active',
          },
          include: {
            route: true,
            driver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    return c.json(trucks);
  } catch (error) {
    console.error('Failed to fetch trucks:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Get all routes
router.get('/routes', async (c) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        waypoints: {
          orderBy: { sequenceOrder: 'asc' },
        },
        schedules: true,
        assignments: {
          include: {
            truck: true,
            driver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    return c.json(routes);
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default router;
