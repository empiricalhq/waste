export const RouteQueries = {
  findAllActiveWithDetails: `
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
  `,
  create: `
    INSERT INTO route (id, name, description, start_lat, start_lng, estimated_duration_minutes, created_by)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
  findWaypointsByRouteId: `
    SELECT * FROM route_waypoint
    WHERE route_id = $1
    ORDER BY sequence_order ASC
  `,
  createWaypoint: `
    INSERT INTO route_waypoint (id, route_id, sequence_order, lat, lng, estimated_arrival_offset_minutes)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
  `,
} as const;
