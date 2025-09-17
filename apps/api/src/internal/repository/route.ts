import type { Database } from '@/internal/database/connection';
import { RouteQueries } from '@/internal/database/queries';
import type { CreateRouteRequest, Route, RouteWaypoint, RouteWithDetails } from '@/internal/models/route';

const ETA_MINUTES_PER_SEQUENCE_STEP = 5; // Estimated minutes per waypoint step

export class RouteRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findAllActive(): Promise<RouteWithDetails[]> {
    const result = await this.db.query<RouteWithDetails>(RouteQueries.findAllActiveWithDetails);
    return result.rows;
  }

  create(data: CreateRouteRequest, createdBy: string): Promise<Route> {
    return this.db.withTransaction(async (client) => {
      const { name, description, start_lat, start_lng, estimated_duration_minutes, waypoints } = data;

      const routeResult = await client.query<Route>(RouteQueries.create, [
        name,
        description,
        start_lat,
        start_lng,
        estimated_duration_minutes,
        createdBy,
      ]);
      const route = routeResult.rows[0];

      if (!route) {
        throw new Error('Database query failed to return created route.');
      }

      const waypointPromises = waypoints.map((waypoint) =>
        client.query(RouteQueries.createWaypoint, [
          route.id,
          waypoint.sequence_order,
          waypoint.lat,
          waypoint.lng,
          waypoint.sequence_order * ETA_MINUTES_PER_SEQUENCE_STEP,
        ]),
      );
      await Promise.all(waypointPromises);

      return route;
    });
  }

  async findWaypointsByRouteId(routeId: string): Promise<RouteWaypoint[]> {
    const result = await this.db.query<RouteWaypoint>(RouteQueries.findWaypointsByRouteId, [routeId]);
    return result.rows;
  }
}
