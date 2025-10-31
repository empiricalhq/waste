import { Hono, type MiddlewareHandler } from 'hono';
import { z } from 'zod';
import { created, error as errorResponse, noContent, success } from '@/internal/shared/utils/response';
import { HttpStatus } from '@/internal/shared/utils/http-status';
import { CommonSchemas, validateJson, validateParam } from '@/internal/shared/utils/validation';
import { CreateAssignmentSchema } from '../assignments/schemas';
import type { AuthEnv } from '../auth/types';
import { CreateAdminIssueSchema } from '../issues/schemas';
import { CreateRouteSchema } from '../routes/schemas';
import { CreateTruckSchema } from '../trucks/schemas';
import { CreateDriverSchema, CreateUserSchema } from './schemas';
import type { AdminService } from './service';

const IdParamSchema = z.object({ id: CommonSchemas.id });

export function createAdminHandler(
  adminService: AdminService,
  authMiddleware: (allowedRoles: string[]) => MiddlewareHandler<AuthEnv>,
): Hono<AuthEnv> {
  const admin = new Hono<AuthEnv>();

  admin.use('*', authMiddleware(['admin', 'supervisor', 'owner']));

  admin.post('/users', validateJson(CreateUserSchema), async (c) => {
    const userData = c.req.valid('json');
    const session = c.get('session');
    
    if (!session.activeOrganizationId) {
      return errorResponse(c, 'No active organization', HttpStatus.BAD_REQUEST);
    }
    
    const newUser = await adminService.createUser(userData, session.activeOrganizationId);
    return created(c, newUser);
  });

  admin.get('/drivers', async (c) => {
    const drivers = await adminService.getDrivers(c.req.raw.headers);
    return success(c, drivers);
  });

  admin.post('/drivers', validateJson(CreateDriverSchema), async (c) => {
    const driverData = c.req.valid('json');
    const newDriver = await adminService.createDriver(driverData);
    return created(c, newDriver);
  });

  admin.get('/trucks', async (c) => {
    const trucks = await adminService.getTrucks();
    return success(c, trucks);
  });

  admin.post('/trucks', validateJson(CreateTruckSchema), async (c) => {
    const truckData = c.req.valid('json');
    const newTruck = await adminService.createTruck(truckData);
    return created(c, newTruck);
  });

  admin.delete('/trucks/:id', validateParam(IdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    await adminService.deactivateTruck(id);
    return noContent(c);
  });

  admin.get('/routes', async (c) => {
    const routes = await adminService.getRoutes();
    return success(c, routes);
  });

  admin.post('/routes', validateJson(CreateRouteSchema), async (c) => {
    const routeData = c.req.valid('json');
    const user = c.get('user');
    const newRoute = await adminService.createRoute(routeData, user.id);
    return created(c, newRoute);
  });

  admin.get('/routes/:id/waypoints', validateParam(IdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const waypoints = await adminService.getRouteWaypoints(id);
    return success(c, waypoints);
  });

  admin.post('/assignments', validateJson(CreateAssignmentSchema), async (c) => {
    const assignmentData = c.req.valid('json');
    const user = c.get('user');
    const newAssignment = await adminService.createAssignment(assignmentData, user.id);
    return created(c, newAssignment);
  });

  admin.get('/issues', async (c) => {
    const issues = await adminService.getOpenIssues();
    return success(c, issues);
  });

  admin.post('/issues', validateJson(CreateAdminIssueSchema), async (c) => {
    const issueData = c.req.valid('json');
    const user = c.get('user');
    await adminService.createIssue(issueData, user.id);
    return created(c, { message: 'Issue created successfully' });
  });

  return admin;
}
