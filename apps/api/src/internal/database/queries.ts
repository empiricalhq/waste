export const UserQueries = {
  findDrivers: `
    SELECT u.id, u.name, u.email, u."isActive", u."createdAt", m.role
    FROM "user" u
    JOIN member m ON u.id = m."userId"
    WHERE m.role = 'driver'
    ORDER BY u."createdAt" DESC
  `,
} as const;

export const TruckQueries = {
  findAllActiveWithDetails: `
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
  `,
  create: `
    INSERT INTO truck (id, name, license_plate)
    VALUES (gen_random_uuid(), $1, $2)
    RETURNING *
  `,
  deactivate: 'UPDATE truck SET is_active = false WHERE id = $1 RETURNING id',
} as const;

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

export const AssignmentQueries = {
  create: `
    INSERT INTO route_assignment (id, route_id, truck_id, driver_id, assigned_date, scheduled_start_time, scheduled_end_time, notes, assigned_by)
    VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_DATE, $4, $5, $6, $7)
    RETURNING *
  `,
  findCurrentByDriverId: `
    SELECT ra.*, r.name as route_name, r.description as route_description, r.start_lat, r.start_lng, t.name as truck_name, t.license_plate
    FROM route_assignment ra
    JOIN route r ON ra.route_id = r.id
    JOIN truck t ON ra.truck_id = t.id
    WHERE ra.driver_id = $1 AND ra.status IN ('scheduled', 'active')
    ORDER BY ra.scheduled_start_time ASC
    LIMIT 1
  `,
  start: `
    UPDATE route_assignment
    SET status = 'active', actual_start_time = NOW()
    WHERE id = $1 AND driver_id = $2 AND status = 'scheduled'
    RETURNING id
  `,
  complete: `
    UPDATE route_assignment
    SET status = 'completed', actual_end_time = NOW()
    WHERE id = $1 AND driver_id = $2 AND status = 'active'
    RETURNING id
  `,
  findActiveByDriverId: `
    SELECT id, truck_id FROM route_assignment
    WHERE driver_id = $1 AND status = 'active'
    LIMIT 1
  `,
} as const;

export const LocationQueries = {
  upsertTruckCurrentLocation: `
    INSERT INTO truck_current_location (truck_id, route_assignment_id, lat, lng, speed, heading, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (truck_id) DO UPDATE SET
      route_assignment_id = EXCLUDED.route_assignment_id,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      speed = EXCLUDED.speed,
      heading = EXCLUDED.heading,
      updated_at = NOW()
  `,
  createTruckLocationHistory: `
    INSERT INTO truck_location_history (id, truck_id, route_assignment_id, lat, lng, speed, heading)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
  `,
  upsertCitizenProfileLocation: `
    INSERT INTO citizen_profile (user_id, lat, lng, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      updated_at = NOW()
  `,
  findCitizenProfileLocation: 'SELECT lat, lng FROM citizen_profile WHERE user_id = $1',
  findNearbyTrucks: `
    SELECT
      t.name as truck_name,
      ( 6371 * acos( cos(radians($1)) * cos(radians(tcl.lat)) * cos(radians(tcl.lng) - radians($2)) + sin(radians($1)) * sin(radians(tcl.lat)) ) ) AS distance_km
    FROM truck_current_location tcl
    JOIN truck t ON tcl.truck_id = t.id
    JOIN route_assignment ra ON tcl.route_assignment_id = ra.id
    WHERE ra.status = 'active' AND tcl.updated_at > NOW() - INTERVAL '10 minutes'
      AND ( 6371 * acos( cos(radians($1)) * cos(radians(tcl.lat)) * cos(radians(tcl.lng) - radians($2)) + sin(radians($1)) * sin(radians(tcl.lat)) ) ) < 1
    ORDER BY distance_km ASC
    LIMIT 1
  `,
} as const;

export const IssueQueries = {
  createCitizenIssue: `
    INSERT INTO citizen_issue_report (id, user_id, type, description, photo_url, lat, lng)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
  findCitizenIssuesByUserId: `
    SELECT * FROM citizen_issue_report
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,
  createDriverIssue: `
    INSERT INTO driver_issue_report (id, driver_id, route_assignment_id, type, notes, lat, lng)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
  findOpenDriverIssues: `
    SELECT 'driver' as source, id, type, status, created_at, notes as description, lat, lng
    FROM driver_issue_report
    WHERE status = 'open'
  `,
  findOpenCitizenIssues: `
    SELECT 'citizen' as source, id, type, status, created_at, description, lat, lng
    FROM citizen_issue_report
    WHERE status = 'open'
  `,
} as const;
