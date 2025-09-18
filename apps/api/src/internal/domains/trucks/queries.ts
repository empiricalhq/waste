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
