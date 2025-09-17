import type { Database } from '@/internal/database/connection';
import { AssignmentQueries } from '@/internal/database/queries';
import type { AssignmentWithDetails, CreateAssignmentRequest, RouteAssignment } from '@/internal/models/assignment';

export class AssignmentRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(data: CreateAssignmentRequest, assignedBy: string): Promise<RouteAssignment> {
    const { route_id, truck_id, driver_id, scheduled_start_time, scheduled_end_time, notes } = data;
    const result = await this.db.query<RouteAssignment>(AssignmentQueries.create, [
      route_id,
      truck_id,
      driver_id,
      scheduled_start_time,
      scheduled_end_time,
      notes,
      assignedBy,
    ]);

    if (!result.rows[0]) {
      throw new Error('Database query failed to return created assignment.');
    }
    return result.rows[0];
  }

  async findCurrentByDriverId(driverId: string): Promise<AssignmentWithDetails | null> {
    const result = await this.db.query<AssignmentWithDetails>(AssignmentQueries.findCurrentByDriverId, [driverId]);
    return result.rows[0] || null;
  }

  async start(id: string, driverId: string): Promise<boolean> {
    const result = await this.db.query(AssignmentQueries.start, [id, driverId]);
    return result.rowCount > 0;
  }

  async complete(id: string, driverId: string): Promise<boolean> {
    const result = await this.db.query(AssignmentQueries.complete, [id, driverId]);
    return result.rowCount > 0;
  }

  async findActiveByDriverId(driverId: string): Promise<{ id: string; truck_id: string } | null> {
    const result = await this.db.query<{ id: string; truck_id: string }>(AssignmentQueries.findActiveByDriverId, [
      driverId,
    ]);
    return result.rows[0] || null;
  }
}
