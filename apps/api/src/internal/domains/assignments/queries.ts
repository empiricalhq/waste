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
