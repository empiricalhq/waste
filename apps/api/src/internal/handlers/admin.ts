import { Hono, type MiddlewareHandler } from 'hono';
import { validateJson, validateParam } from '@/internal/middleware/validation';
import type { AdminService } from '@/internal/services/admin';
import type { AuthSession, AuthUser } from '@/internal/services/auth';
import { created, noContent, success } from '@/internal/utils/response';
import {
  CreateAssignmentSchema,
  CreateRouteSchema,
  CreateTruckSchema,
  IdParamSchema,
} from '@/internal/utils/validation';

type AuthEnv = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

export function createAdminHandler(
  adminService: AdminService,
  authMiddleware: (allowedRoles: string[]) => MiddlewareHandler<AuthEnv>,
): Hono<AuthEnv> {
  const admin = new Hono<AuthEnv>();

  admin.use('*', authMiddleware(['admin', 'supervisor', 'owner']));

  admin.get('/drivers', async (c) => {
    const drivers = await adminService.getDrivers();
    return success(c, drivers);
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

  return admin;
}
