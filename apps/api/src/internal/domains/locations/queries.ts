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
