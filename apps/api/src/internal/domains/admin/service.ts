import { APIError } from 'better-auth/api';
import { BaseService } from '@/internal/shared/services/base-service';
import { ConflictError, NotFoundError, ValidationError } from '@/internal/shared/utils/errors';
import type { CreateAssignmentRequest, RouteAssignment } from '../assignments/models';
import type { AssignmentRepository } from '../assignments/repository';
import type { AuthService } from '../auth/service';
import type { CitizenIssueType, IssueReportSummary } from '../issues/models';
import type { IssueRepository } from '../issues/repository';
import type { CreateRouteRequest, Route, RouteWaypoint, RouteWithDetails } from '../routes/models';
import type { RouteRepository } from '../routes/repository';
import type { CreateTruckRequest, Truck, TruckWithDetails } from '../trucks/models';
import type { TruckRepository } from '../trucks/repository';
import type { UserWithRole } from '../users/models';

interface AdminServiceDependencies {
  truckRepo: TruckRepository;
  routeRepo: RouteRepository;
  assignmentRepo: AssignmentRepository;
  issueRepo: IssueRepository;
  authService: AuthService;
}

export class AdminService extends BaseService {
  private readonly truckRepo: TruckRepository;
  private readonly routeRepo: RouteRepository;
  private readonly assignmentRepo: AssignmentRepository;
  private readonly issueRepo: IssueRepository;
  private readonly authService: AuthService;

  constructor({ truckRepo, routeRepo, assignmentRepo, issueRepo, authService }: AdminServiceDependencies) {
    super();
    this.truckRepo = truckRepo;
    this.routeRepo = routeRepo;
    this.assignmentRepo = assignmentRepo;
    this.issueRepo = issueRepo;
    this.authService = authService;
  }

  async getDrivers(headers: Headers): Promise<UserWithRole[]> {
    try {
      const response = await this.authService.api.listUsers({
        headers,
        query: {
          limit: 1000,
          filterField: 'role',
          filterOperator: 'eq',
          filterValue: 'driver',
        },
      });

      return response.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: new Date(user.createdAt),
        role: 'driver',
      }));
    } catch (error) {
      throw new Error('Failed to retrieve drivers due to an internal error.', { cause: error });
    }
  }

  async createDriver(data: { name: string; email: string; password: string }): Promise<UserWithRole> {
    try {
      const result = await this.authService.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'driver',
        },
      });
      return { ...result.user, role: 'driver', createdAt: new Date(result.user.createdAt) };
    } catch (error) {
      this.handleAuthApiError(error);
    }
  }

  async getTrucks(): Promise<TruckWithDetails[]> {
    return this.truckRepo.findAllActive();
  }

  async createTruck(data: CreateTruckRequest): Promise<Truck> {
    try {
      return await this.truckRepo.create(data);
    } catch (error) {
      this.handleDatabaseError(error);
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
      this.handleDatabaseError(error);
    }
  }

  async getOpenIssues(): Promise<IssueReportSummary[]> {
    return this.issueRepo.findAllOpen();
  }

  async createIssue(
    data: { type: string; description?: string; lat: number; lng: number },
    createdBy: string,
  ): Promise<void> {
    await this.issueRepo.createCitizenIssue(createdBy, {
      ...data,
      type: data.type as CitizenIssueType,
    });
  }

  private handleAuthApiError(error: unknown): never {
    if (error instanceof APIError) {
      if (error.status === 409) {
        throw new ConflictError(error.message);
      }
      if (error.status === 400) {
        throw new ValidationError(error.message);
      }
    }
    throw error;
  }
}
