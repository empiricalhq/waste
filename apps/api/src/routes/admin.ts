import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Session, User } from '@/lib/auth.ts';
import { db, withTransaction } from '@/lib/db.ts';
import { authMiddleware } from '@/lib/middleware.ts';
import { createAssignmentSchema, createRouteSchema, createTruckSchema, uuidParamSchema } from '@/lib/validation.ts';

type AuthEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};

export const adminRouter = new Hono<AuthEnv>();

// requirement: admin or supervisor role for all routes
adminRouter.use('*', authMiddleware(['admin', 'supervisor']));

adminRouter.get('/drivers', async (c) => {
  try {
    const result = await db.query(`
      SELECT id, name, email, "appRole", "isActive", "createdAt"
      FROM "user"
      WHERE "appRole" = 'driver'
      ORDER BY "createdAt" DESC
    `);
    return c.json(result.rows);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return c.json({ error: 'Failed to fetch drivers' }, 500);
  }
});

adminRouter.get('/trucks', async (c) => {
  try {
    const result = await db.query(`
      SELECT
        t.*,
        tcl.lat,
        tcl.lng,
        tcl.updated_at as location_updated_at,
        u.name as driver_name,
        ra.status as assignment_status
      FROM truck t
      LEFT JOIN truck_current_location tcl ON t.id = tcl.truck_id
      LEFT JOIN route_assignment ra ON t.id = ra.truck_id AND ra.status IN ('scheduled', 'active')
      LEFT JOIN "user" u ON ra.driver_id = u.id
      WHERE t.is_active = true
      ORDER BY t.created_at DESC
    `);
    return c.json(result.rows);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return c.json({ error: 'Failed to fetch trucks' }, 500);
  }
});

adminRouter.post('/trucks', zValidator('json', createTruckSchema), async (c) => {
  const { name, license_plate } = c.req.valid('json');

  try {
    const result = await db.query(
      `
      INSERT INTO truck (id, name, license_plate)
      VALUES (gen_random_uuid(), $1, $2)
      RETURNING *
    `,
      [name, license_plate],
    );

    return c.json(result.rows[0], 201);
  } catch (error) {
    console.error('Error creating truck:', error);
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return c.json({ error: 'License plate already exists' }, 409);
    }
    return c.json({ error: 'Failed to create truck' }, 500);
  }
});

adminRouter.delete('/trucks/:id', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const result = await db.query(
      `
      UPDATE truck SET is_active = false WHERE id = $1
      RETURNING id
    `,
      [id],
    );

    if (result.rowCount === 0) {
      return c.json({ error: 'Truck not found' }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    console.error('Error deactivating truck:', error);
    return c.json({ error: 'Failed to deactivate truck' }, 500);
  }
});

adminRouter.get('/routes', async (c) => {
  try {
    const result = await db.query(`
      SELECT
        r.*,
        u.name as created_by_name,
        COUNT(rw.id) as waypoint_count
      FROM route r
      LEFT JOIN "user" u ON r.created_by = u.id
      LEFT JOIN route_waypoint rw ON r.id = rw.route_id
      WHERE r.status = 'active'
      GROUP BY r.id, u.name
      ORDER BY r.created_at DESC
    `);
    return c.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return c.json({ error: 'Failed to fetch routes' }, 500);
  }
});

adminRouter.post('/routes', zValidator('json', createRouteSchema), async (c) => {
  const routeData = c.req.valid('json');
  const user = c.get('user');

  try {
    const result = await withTransaction(async (client) => {
      // 1. create route
      const routeResult = await client.query(
        `
        INSERT INTO route (
          id, name, description, start_lat, start_lng,
          estimated_duration_minutes, created_by
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [
          routeData.name,
          routeData.description,
          routeData.start_lat,
          routeData.start_lng,
          routeData.estimated_duration_minutes,
          user.id,
        ],
      );

      const route = routeResult.rows[0];

      // 2. create waypoints
      for (const waypoint of routeData.waypoints) {
        await client.query(
          `
          INSERT INTO route_waypoint (
            id, route_id, sequence_order, lat, lng,
            estimated_arrival_offset_minutes
          )
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
        `,
          [
            route.id,
            waypoint.sequence_order,
            waypoint.lat,
            waypoint.lng,
            waypoint.sequence_order * 10, // TODO: Implement proper estimation logic or maybe require the user to provide it
          ],
        );
      }

      return route;
    });

    return c.json(result, 201);
  } catch (error) {
    console.error('Error creating route:', error);
    return c.json({ error: 'Failed to create route' }, 500);
  }
});

adminRouter.get('/routes/:id/waypoints', zValidator('param', uuidParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  try {
    const result = await db.query(
      `
      SELECT * FROM route_waypoint
      WHERE route_id = $1
      ORDER BY sequence_order ASC
    `,
      [id],
    );

    return c.json(result.rows);
  } catch (error) {
    console.error('Error fetching waypoints:', error);
    return c.json({ error: 'Failed to fetch waypoints' }, 500);
  }
});

adminRouter.post('/assignments', zValidator('json', createAssignmentSchema), async (c) => {
  const assignmentData = c.req.valid('json');
  const user = c.get('user');

  try {
    const result = await db.query(
      `
      INSERT INTO route_assignment (
        id, route_id, truck_id, driver_id,
        assigned_date, scheduled_start_time, scheduled_end_time,
        notes, assigned_by
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3,
        CURRENT_DATE, $4, $5, $6, $7
      )
      RETURNING *
    `,
      [
        assignmentData.route_id,
        assignmentData.truck_id,
        assignmentData.driver_id,
        assignmentData.scheduled_start_time,
        assignmentData.scheduled_end_time,
        assignmentData.notes,
        user.id,
      ],
    );

    return c.json(result.rows[0], 201);
  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error instanceof Error && 'code' in error && error.code === '23503') {
      return c.json({ error: 'Invalid route, truck, or driver ID' }, 400);
    }
    return c.json({ error: 'Failed to create assignment' }, 500);
  }
});

adminRouter.get('/issues', async (c) => {
  try {
    const [driverIssues, citizenIssues] = await Promise.all([
      db.query(`
        SELECT
          'driver' as source,
          id, type, status, created_at, notes as description,
          lat, lng
        FROM driver_issue_report
        WHERE status = 'open'
        ORDER BY created_at DESC
      `),
      db.query(`
        SELECT
          'citizen' as source,
          id, type, status, created_at, description,
          lat, lng
        FROM citizen_issue_report
        WHERE status = 'open'
        ORDER BY created_at DESC
      `),
    ]);

    const allIssues = [...driverIssues.rows, ...citizenIssues.rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return c.json(allIssues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return c.json({ error: 'Failed to fetch issues' }, 500);
  }
});
