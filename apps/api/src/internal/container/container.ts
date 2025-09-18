import { createAdminHandler } from '@/internal/domains/admin/handler';
import { AdminService } from '@/internal/domains/admin/service';
import { AssignmentRepository } from '@/internal/domains/assignments/repository';
import { createAuthHandler } from '@/internal/domains/auth/handler';

// Domain imports
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
  // 1. Configuration and Dependencies
  const config = loadConfig();
  const db = new Database(config.database);

  // 2. Repositories (Data Access Layer)
  const userRepo = new UserRepository(db);
  const truckRepo = new TruckRepository(db);
  const routeRepo = new RouteRepository(db);
  const assignmentRepo = new AssignmentRepository(db);
  const issueRepo = new IssueRepository(db);

  // 3. Services (Business Logic Layer)
  const authService = new AuthService(config, db);
  const adminService = new AdminService(truckRepo, routeRepo, assignmentRepo, userRepo, issueRepo);
  const driverService = new DriverService(assignmentRepo, routeRepo, issueRepo, db);
  const citizenService = new CitizenService(issueRepo, db);

  // 4. Middleware
  const corsMiddleware = createCorsMiddleware(config);
  const authMiddleware = createAuthMiddleware(authService, db);
  const citizenOnlyMiddleware = createCitizenOnlyMiddleware(authService);

  // 5. Handlers (Presentation Layer)
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
