import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Session, User } from '@/lib/auth.ts';
import { db, withTransaction } from '@/lib/db.ts';
import { authMiddleware } from '@/lib/middleware.ts';
import { createDriverIssueSchema, IdParamSchema, updateDriverLocationSchema } from '@/lib/validation.ts';

type AuthEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const driverRouter = new Hono<AuthEnv>();

driverRouter.use('*', authMiddleware(['driver']));

driverRouter.get('/route/current', async (c) => {
  const user = c.get('user');

  try {
    const result = await db.query(
      `
      SELECT 
        ra.*,
        r.name as route_name,
        r.description as route_description,
        r.start_lat,
        r.start_lng,
        t.name as truck_name,
        t.license_plate
      FROM route_assignment ra
      JOIN route r ON ra.route_id = r.id
      JOIN truck t ON ra.truck_id = t.id
      WHERE ra.driver_id = $1 
        AND ra.status IN ('scheduled', 'active')
      ORDER BY ra.scheduled_start_time ASC 
      LIMIT 1
    `,
      [user.id],
    );

    if (result.rowCount === 0) {
      return c.json({ error: 'No upcoming or active route found' }, 404);
    }

    const assignment = result.rows[0];

    const waypointsResult = await db.query(
      `
      SELECT * FROM route_waypoint 
      WHERE route_id = $1 
      ORDER BY sequence_order ASC
    `,
      [assignment.route_id],
    );

    return c.json({
      ...assignment,
      waypoints: waypointsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching current route:', error);
    return c.json({ error: 'Failed to fetch current route' }, 500);
  }
});

driverRouter.post('/assignments/:id/start', zValidator('param', IdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  try {
    const result = await db.query(
      `
      UPDATE route_assignment 
      SET status = 'active', actual_start_time = NOW()
      WHERE id = $1 AND driver_id = $2 AND status = 'scheduled'
      RETURNING *
    `,
      [id, user.id],
    );

    if (result.rowCount === 0) {
      return c.json({ error: 'Assignment not found or already started' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error starting assignment:', error);
    return c.json({ error: 'Failed to start assignment' }, 500);
  }
});

driverRouter.post('/assignments/:id/complete', zValidator('param', IdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  try {
    const result = await db.query(
      `
      UPDATE route_assignment 
      SET status = 'completed', actual_end_time = NOW()
      WHERE id = $1 AND driver_id = $2 AND status = 'active'
      RETURNING *
    `,
      [id, user.id],
    );

    if (result.rowCount === 0) {
      return c.json({ error: 'Assignment not found or not active' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error completing assignment:', error);
    return c.json({ error: 'Failed to complete assignment' }, 500);
  }
});

driverRouter.post('/location', zValidator('json', updateDriverLocationSchema), async (c) => {
  const { lat, lng, speed, heading } = c.req.valid('json');
  const user = c.get('user');

  try {
    await withTransaction(async (client) => {
      const assignmentResult = await client.query(
        `
        SELECT ra.id as assignment_id, ra.truck_id
        FROM route_assignment ra
        WHERE ra.driver_id = $1 AND ra.status = 'active'
        LIMIT 1
      `,
        [user.id],
      );

      if (assignmentResult.rowCount === 0) {
        throw new Error('No active assignment found');
      }

      const { assignment_id, truck_id } = assignmentResult.rows[0];

      await client.query(
        `
        INSERT INTO truck_current_location 
        (truck_id, route_assignment_id, lat, lng, speed, heading)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (truck_id) 
        DO UPDATE SET 
          route_assignment_id = $2,
          lat = $3,
          lng = $4,
          speed = $5,
          heading = $6,
          updated_at = NOW()
      `,
        [truck_id, assignment_id, lat, lng, speed, heading],
      );

      await client.query(
        `
        INSERT INTO truck_location_history 
        (id, truck_id, route_assignment_id, lat, lng, speed, heading)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
      `,
        [truck_id, assignment_id, lat, lng, speed, heading],
      );
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating location:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

driverRouter.post('/issues', zValidator('json', createDriverIssueSchema), async (c) => {
  const { type, notes, lat, lng } = c.req.valid('json');
  const user = c.get('user');

  try {
    const assignmentResult = await db.query(
      `
      SELECT id FROM route_assignment 
      WHERE driver_id = $1 AND status = 'active'
      LIMIT 1
    `,
      [user.id],
    );

    if (assignmentResult.rowCount === 0) {
      return c.json({ error: 'No active assignment found' }, 400);
    }

    const assignmentId = assignmentResult.rows[0].id;

    await db.query(
      `
      INSERT INTO driver_issue_report 
      (id, driver_id, route_assignment_id, type, notes, lat, lng)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    `,
      [user.id, assignmentId, type, notes, lat, lng],
    );

    return c.json({ message: 'Issue reported successfully' }, 201);
  } catch (error) {
    console.error('Error reporting issue:', error);
    return c.json({ error: 'Failed to report issue' }, 500);
  }
});
