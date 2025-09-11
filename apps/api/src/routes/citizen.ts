import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Session, User } from '@/lib/auth.ts';
import { db } from '@/lib/db.ts';
import { authMiddleware } from '@/lib/middleware.ts';
import { createIssueSchema, updateLocationSchema } from '@/lib/validation.ts';

type AuthEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const citizenRouter = new Hono<AuthEnv>();

citizenRouter.use('*', authMiddleware(['citizen']));

citizenRouter.get('/truck/status', async (c) => {
  const user = c.get('user');

  try {
    // get citizen's location (provided by them by this point)
    // otherwise, the client should handle this error by:
    // - asking the user for their location
    // - hit the api again but with the user's location
    const profileResult = await db.query(
      `
      SELECT lat, lng FROM citizen_profile WHERE user_id = $1
    `,
      [user.id],
    );

    if (profileResult.rowCount === 0 || !profileResult.rows[0]?.lat) {
      return c.json({
        status: 'LOCATION_NOT_SET',
        message: 'Please set your location first',
      });
    }

    const { lat: userLat, lng: userLng } = profileResult.rows[0];

    // find nearby trucks (within ~1km using simple distance calculation)
    const trucksResult = await db.query(
      `
      SELECT
        tcl.*,
        t.name as truck_name,
        ra.status as assignment_status,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(tcl.lat)) *
            cos(radians(tcl.lng) - radians($2)) +
            sin(radians($1)) * sin(radians(tcl.lat))
          )
        ) AS distance_km
      FROM truck_current_location tcl
      JOIN truck t ON tcl.truck_id = t.id
      JOIN route_assignment ra ON tcl.route_assignment_id = ra.id
      WHERE ra.status = 'active'
        AND tcl.updated_at > NOW() - INTERVAL '10 minutes'
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(tcl.lat)) *
            cos(radians(tcl.lng) - radians($2)) +
            sin(radians($1)) * sin(radians(tcl.lat))
          )
        ) < 1
      ORDER BY distance_km ASC
      LIMIT 1
    `,
      [userLat, userLng],
    );

    if ((trucksResult.rowCount ?? 0) > 0) {
      const truck = trucksResult.rows[0];
      const distanceKm = truck.distance_km;
      const etaMinutes = Math.round(distanceKm * 10); // TODO: Implement ETA calculation

      if (distanceKm < 0.1) {
        return c.json({
          status: 'NEARBY',
          etaMinutes: Math.max(1, etaMinutes),
          truck: truck.truck_name,
        });
      } else {
        return c.json({
          status: 'ON_THE_WAY',
          etaMinutes,
          truck: truck.truck_name,
        });
      }
    }

    return c.json({
      status: 'NOT_SCHEDULED',
      message: 'No trucks currently scheduled for your area',
    });
  } catch (error) {
    console.error('Error getting truck status:', error);
    return c.json({ error: 'Failed to get truck status' }, 500);
  }
});

citizenRouter.put('/profile/location', zValidator('json', updateLocationSchema), async (c) => {
  const { lat, lng } = c.req.valid('json');
  const user = c.get('user');

  try {
    // TODO: is there a better way to do this?
    await db.query(
      `
      INSERT INTO citizen_profile (user_id, lat, lng, updated_at)
      VALUES ($3, $1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET lat = $1, lng = $2, updated_at = NOW()
    `,
      [lat, lng, user.id],
    );

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating location:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

citizenRouter.post('/issues', zValidator('json', createIssueSchema), async (c) => {
  const { type, description, photo_url, lat, lng } = c.req.valid('json');
  const user = c.get('user');

  try {
    await db.query(
      `
      INSERT INTO citizen_issue_report
      (id, user_id, type, description, photo_url, lat, lng)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    `,
      [user.id, type, description, photo_url, lat, lng],
    );

    return c.json({ message: 'Issue reported successfully' }, 201);
  } catch (error) {
    console.error('Error reporting issue:', error);
    return c.json({ error: 'Failed to report issue' }, 500);
  }
});

citizenRouter.get('/issues', async (c) => {
  const user = c.get('user');

  try {
    const result = await db.query(
      `
      SELECT * FROM citizen_issue_report
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
      [user.id],
    );

    return c.json(result.rows);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return c.json({ error: 'Failed to fetch issues' }, 500);
  }
});
