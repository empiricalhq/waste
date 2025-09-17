import type { CreateAssignmentRequest, RouteAssignment } from '@/internal/models/assignment';
import type { IssueReportSummary } from '@/internal/models/issue';
import type { CreateRouteRequest, Route, RouteWaypoint, RouteWithDetails } from '@/internal/models/route';
import type { CreateTruckRequest, Truck, TruckWithDetails } from '@/internal/models/truck';
import type { UserWithRole } from '@/internal/models/user';
import type { AssignmentRepository } from '@/internal/repository/assignment';
import type { IssueRepository } from '@/internal/repository/issue';
import type { RouteRepository } from '@/internal/repository/route';
import type { TruckRepository } from '@/internal/repository/truck';
import type { UserRepository } from '@/internal/repository/user';
import { ConflictError, NotFoundError, ValidationError } from '@/internal/utils/errors';

export class AdminService {
  private readonly truckRepo: TruckRepository;
  private readonly routeRepo: RouteRepository;
  private readonly assignmentRepo: AssignmentRepository;
  private readonly userRepo: UserRepository;
  private readonly issueRepo: IssueRepository;

  constructor(
    truckRepo: TruckRepository,
    routeRepo: RouteRepository,
    assignmentRepo: AssignmentRepository,
    userRepo: UserRepository,
    issueRepo: IssueRepository,
  ) {
    this.truckRepo = truckRepo;
    this.routeRepo = routeRepo;
    this.assignmentRepo = assignmentRepo;
    this.userRepo = userRepo;
    this.issueRepo = issueRepo;
  }

  async getDrivers(): Promise<UserWithRole[]> {
    return this.userRepo.findDrivers();
  }

  async getTrucks(): Promise<TruckWithDetails[]> {
    return this.truckRepo.findAllActive();
  }

  async createTruck(data: CreateTruckRequest): Promise<Truck> {
    try {
      return await this.truckRepo.create(data);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        throw new ConflictError('License plate already exists');
      }
      throw error;
    }
  }

  async deactivateTruck(id: string): Promise<void> {
    const success = await this.truckRepo.deactivate(id);
    if (!success) {
      throw new NotFoundError('Truck not found');
    }
  }

  async getRoutes(): Promise<RouteWithDetails[]> {
    return this.routeRepo.findAllActive();
  }

  async createRoute(data: CreateRouteRequest, createdBy: string): Promise<Route> {
    return this.routeRepo.create(data, createdBy);
  }

  async getRouteWaypoints(routeId: string): Promise<RouteWaypoint[]> {
    return this.routeRepo.findWaypointsByRouteId(routeId);
  }

  async createAssignment(data: CreateAssignmentRequest, assignedBy: string): Promise<RouteAssignment> {
    try {
      return await this.assignmentRepo.create(data, assignedBy);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
        throw new ValidationError('Invalid route, truck, or driver ID provided');
      }
      throw error;
    }
  }

  async getOpenIssues(): Promise<IssueReportSummary[]> {
    return this.issueRepo.findAllOpen();
  }
}
