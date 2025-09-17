import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';

import { loadConfig } from '@/internal/config/config';
import { Database } from '@/internal/database/connection';
import { createAdminHandler } from '@/internal/handlers/admin';
import { createAuthHandler } from '@/internal/handlers/auth';
import { createCitizenHandler } from '@/internal/handlers/citizen';
import { createDriverHandler } from '@/internal/handlers/driver';
import { createHealthHandler } from '@/internal/handlers/health';
import { createAuthMiddleware, createCitizenOnlyMiddleware } from '@/internal/middleware/auth';
import { createCorsMiddleware } from '@/internal/middleware/cors';
import { AssignmentRepository } from '@/internal/repository/assignment';
import { IssueRepository } from '@/internal/repository/issue';
import { RouteRepository } from '@/internal/repository/route';
import { TruckRepository } from '@/internal/repository/truck';
import { UserRepository } from '@/internal/repository/user';
import { AdminService } from '@/internal/services/admin';
import { AuthService } from '@/internal/services/auth';
import { CitizenService } from '@/internal/services/citizen';
import { DriverService } from '@/internal/services/driver';
import { AppError } from '@/internal/utils/errors';
import { HttpStatus } from '@/internal/utils/http-status';
import { error as errorResponse, notFound, validationError } from '@/internal/utils/response';

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

// 6. Application Setup
const app = new Hono();

// Global Middleware
app.use('*', corsMiddleware);
app.use('*', secureHeaders());

// Routing
app.route('/api', healthHandler);
app.route('/api/auth', authHandler);
app.route('/api/admin', adminHandler);
app.route('/api/driver', driverHandler);
app.route('/api/citizen', citizenHandler);

app.onError((err, c) => {
  if (err instanceof AppError) {
    return errorResponse(c, err.message, err.statusCode);
  }

  if (err instanceof z.ZodError) {
    const { formErrors, fieldErrors } = err.flatten();
    return validationError(c, formErrors, fieldErrors);
  }
  return errorResponse(c, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
});

app.notFound((c) => {
  return notFound(c, 'Not found');
});

export default app;
