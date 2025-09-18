import { createAdminHandler } from '@/internal/domains/admin/handler';
import { AdminService } from '@/internal/domains/admin/service';
import { AssignmentRepository } from '@/internal/domains/assignments/repository';
import { createAuthHandler } from '@/internal/domains/auth/handler';

import { AuthService } from '@/internal/domains/auth/service';
import { createCitizenHandler } from '@/internal/domains/citizen/handler';
import { CitizenService } from '@/internal/domains/citizen/service';
import { createDriverHandler } from '@/internal/domains/driver/handler';
import { DriverService } from '@/internal/domains/driver/service';
import { createHealthHandler } from '@/internal/domains/health/handler';
import { IssueRepository } from '@/internal/domains/issues/repository';
import { RouteRepository } from '@/internal/domains/routes/repository';
import { TruckRepository } from '@/internal/domains/trucks/repository';
import { UserRepository } from '@/internal/domains/users/repository';
import { loadConfig } from '@/internal/shared/config/config';
import { Database } from '@/internal/shared/database/database';
import { createAuthMiddleware, createCitizenOnlyMiddleware } from '@/internal/shared/middleware/auth';
import { createCorsMiddleware } from '@/internal/shared/middleware/cors';

export function createContainer() {
  const config = loadConfig();
  const db = new Database(config.database);

  // repositories: data access layer
  const userRepo = new UserRepository(db);
  const truckRepo = new TruckRepository(db);
  const routeRepo = new RouteRepository(db);
  const assignmentRepo = new AssignmentRepository(db);
  const issueRepo = new IssueRepository(db);

  // services: business logic layer
  const authService = new AuthService(config, db);
  const adminService = new AdminService(truckRepo, routeRepo, assignmentRepo, userRepo, issueRepo);
  const driverService = new DriverService(assignmentRepo, routeRepo, issueRepo, db);
  const citizenService = new CitizenService(issueRepo, db);

  // middleware
  const corsMiddleware = createCorsMiddleware(config);
  const authMiddleware = createAuthMiddleware(authService, db);
  const citizenOnlyMiddleware = createCitizenOnlyMiddleware(authService);

  // handlers (presentation layer)
  const authHandler = createAuthHandler(authService);
  const adminHandler = createAdminHandler(adminService, authMiddleware);
  const driverHandler = createDriverHandler(driverService, authMiddleware);
  const citizenHandler = createCitizenHandler(citizenService, citizenOnlyMiddleware);
  const healthHandler = createHealthHandler();

  return {
    getHandlers: () => ({
      admin: adminHandler,
      auth: authHandler,
      citizen: citizenHandler,
      driver: driverHandler,
      health: healthHandler,
    }),
    getCorsMiddleware: () => corsMiddleware,
  };
}
