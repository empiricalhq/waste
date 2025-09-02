import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { authMiddleware, roleMiddleware } from '@/lib/middleware';
import { db, citizenProfile } from '@lima-garbage/database';

const app = new Hono();

app.use('*', authMiddleware, roleMiddleware(['citizen']));

type TruckStatusResponse =
  | { status: 'NEARBY' | 'ON_THE_WAY'; etaMinutes: number }
  | { status: 'NOT_SCHEDULED'; nextCollectionDay: string };

/**
 * GET /api/trucks/status
 */
app.get('/status', async (c) => {
  const user = c.get('user');

  const userId = user!.id;

  try {
    const profile = await db.query.citizenProfile.findFirst({
      where: eq(citizenProfile.userId, userId),
    });

    if (!profile || !profile.lat || !profile.lng) {
      return c.json({
        status: 'NOT_SCHEDULED',
        nextCollectionDay: 'Ubicación no configurada',
      });
    }

    // --- Complex Business Logic Would Go Here ---
    // 1. Find active route assignments near the citizen's coordinates (profile.lat, profile.lng).
    // 2. Query `truckCurrentLocation` for the assigned truck.
    // 3. Calculate the ETA based on distance, traffic, and route waypoints.
    // 4. If no active route is found, determine the next scheduled day from `routeSchedule`.
    // ---------------------------------------------

    // For now, we'll return a simulated response as planned.
    const isNearby = Math.random() > 0.5;

    if (isNearby) {
      const eta = Math.floor(Math.random() * 10) + 2; // 2 to 12 minutes
      const response: TruckStatusResponse = {
        status: eta < 5 ? 'NEARBY' : 'ON_THE_WAY',
        etaMinutes: eta,
      };
      return c.json(response);
    } else {
      const response: TruckStatusResponse = {
        status: 'NOT_SCHEDULED',
        nextCollectionDay: 'Mañana por la mañana',
      };
      return c.json(response);
    }
  } catch (error) {
    console.error('Failed to fetch truck status:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app;
