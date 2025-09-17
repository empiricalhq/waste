import type { Database } from '@/internal/database/connection';
import { LocationQueries } from '@/internal/database/queries';
import type { AssignmentWithDetails } from '@/internal/models/assignment';
import type { CreateDriverIssueRequest } from '@/internal/models/issue';
import type { AssignmentRepository } from '@/internal/repository/assignment';
import type { IssueRepository } from '@/internal/repository/issue';
import type { RouteRepository } from '@/internal/repository/route';
import { NotFoundError, ValidationError } from '@/internal/utils/errors';

export class DriverService {
  private readonly assignmentRepo: AssignmentRepository;
  private readonly routeRepo: RouteRepository;
  private readonly issueRepo: IssueRepository;
  private readonly db: Database;

  constructor(
    assignmentRepo: AssignmentRepository,
    routeRepo: RouteRepository,
    issueRepo: IssueRepository,
    db: Database,
  ) {
    this.assignmentRepo = assignmentRepo;
    this.routeRepo = routeRepo;
    this.issueRepo = issueRepo;
    this.db = db;
  }

  async getCurrentRoute(driverId: string): Promise<AssignmentWithDetails> {
    const assignment = await this.assignmentRepo.findCurrentByDriverId(driverId);
    if (!assignment) {
      throw new NotFoundError('No upcoming or active route found');
    }

    assignment.waypoints = await this.routeRepo.findWaypointsByRouteId(assignment.route_id);
    return assignment;
  }

  async startAssignment(id: string, driverId: string): Promise<void> {
    const started = await this.assignmentRepo.start(id, driverId);
    if (!started) {
      throw new NotFoundError('Assignment not found or could not be started');
    }
  }

  async completeAssignment(id: string, driverId: string): Promise<void> {
    const completed = await this.assignmentRepo.complete(id, driverId);
    if (!completed) {
      throw new NotFoundError('Assignment not found or could not be completed');
    }
  }

  async updateLocation(
    driverId: string,
    location: { lat: number; lng: number; speed?: number; heading?: number },
  ): Promise<void> {
    await this.db.withTransaction(async (client) => {
      const assignmentRes = await client.query<{ id: string; truck_id: string }>(
        `SELECT id, truck_id FROM route_assignment WHERE driver_id = $1 AND status = 'active' LIMIT 1`,
        [driverId],
      );

      const assignment = assignmentRes.rows[0];
      if (!assignment) {
        throw new ValidationError('No active assignment found for location update');
      }
      const { id: assignmentId, truck_id: truckId } = assignment;

      await client.query(LocationQueries.upsertTruckCurrentLocation, [
        truckId,
        assignmentId,
        location.lat,
        location.lng,
        location.speed,
        location.heading,
      ]);
      await client.query(LocationQueries.createTruckLocationHistory, [
        truckId,
        assignmentId,
        location.lat,
        location.lng,
        location.speed,
        location.heading,
      ]);
    });
  }

  async reportIssue(driverId: string, data: CreateDriverIssueRequest): Promise<void> {
    const assignment = await this.assignmentRepo.findActiveByDriverId(driverId);
    if (!assignment) {
      throw new ValidationError('No active assignment found to report an issue');
    }
    await this.issueRepo.createDriverIssue(driverId, assignment.id, data);
  }
}
