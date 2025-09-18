import { BaseRepository } from '@/internal/shared/repository/base-repository';
import type { AssignmentWithDetails, CreateAssignmentRequest, RouteAssignment } from './models';
import { AssignmentQueries } from './queries';

export class AssignmentRepository extends BaseRepository {
  async create(data: CreateAssignmentRequest, assignedBy: string): Promise<RouteAssignment> {
    const { route_id, truck_id, driver_id, scheduled_start_time, scheduled_end_time, notes } = data;
    const result = await this.executeQuery<RouteAssignment>(AssignmentQueries.create, [
      route_id,
      truck_id,
      driver_id,
      scheduled_start_time,
      scheduled_end_time,
      notes,
      assignedBy,
    ]);

    if (!result[0]) {
      throw new Error('Database query failed to return created assignment.');
    }
    return result[0];
  }

  async findCurrentByDriverId(driverId: string): Promise<AssignmentWithDetails | null> {
    return this.executeQuerySingle<AssignmentWithDetails>(AssignmentQueries.findCurrentByDriverId, [driverId]);
  }

  async start(id: string, driverId: string): Promise<boolean> {
    const result = await this.executeQueryWithCount(AssignmentQueries.start, [id, driverId]);
    return result.count > 0;
  }

  async complete(id: string, driverId: string): Promise<boolean> {
    const result = await this.executeQueryWithCount(AssignmentQueries.complete, [id, driverId]);
    return result.count > 0;
  }

  async findActiveByDriverId(driverId: string): Promise<{ id: string; truck_id: string } | null> {
    return this.executeQuerySingle<{ id: string; truck_id: string }>(AssignmentQueries.findActiveByDriverId, [
      driverId,
    ]);
  }
}
