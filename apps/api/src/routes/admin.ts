import { createRouter } from '@/lib/create-app';
import { auth } from '@/lib/auth';
import sql from '@/lib/db';

const router = createRouter();

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

router.get('/trucks', async (c) => {
  try {
    const query = `
      SELECT
        t.*,
        tcl.lat,
        tcl.lng,
        tcl.speed,
        tcl.heading,
        tcl.updated_at as location_updated_at,
        ra.id as assignment_id,
        ra.status as assignment_status,
        r.name as route_name,
        u.name as driver_name,
        u.email as driver_email
      FROM truck t
      LEFT JOIN truck_current_location tcl ON t.id = tcl.truck_id
      LEFT JOIN route_assignment ra ON t.id = ra.truck_id AND ra.status = 'active'
      LEFT JOIN route r ON ra.route_id = r.id
      LEFT JOIN "user" u ON ra.driver_id = u.id
      ORDER BY t.created_at DESC
    `;
    const result = await sql.query(query);
    return c.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch trucks:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

router.get('/routes', async (c) => {
  try {
    const routesQuery = `
      SELECT
        r.*,
        creator.name as creator_name,
        creator.email as creator_email,
        approver.name as approver_name,
        approver.email as approver_email
      FROM route r
      LEFT JOIN "user" creator ON r.created_by = creator.id
      LEFT JOIN "user" approver ON r.approved_by = approver.id
      ORDER BY r.created_at DESC
    `;
    const routesResult = await sql.query(routesQuery);
    const routes = routesResult.rows;

    for (const route of routes) {
      const waypointsResult = await sql.query(
        'SELECT * FROM route_waypoint WHERE route_id = $1 ORDER BY sequence_order ASC',
        [route.id],
      );
      route.waypoints = waypointsResult.rows;

      const schedulesResult = await sql.query(
        'SELECT * FROM route_schedule WHERE route_id = $1 ORDER BY day_of_week ASC',
        [route.id],
      );
      route.schedules = schedulesResult.rows;
    }

    return c.json(routes);
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default router;
