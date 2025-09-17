import { Hono, type MiddlewareHandler } from 'hono';
import { validateJson, validateParam } from '@/internal/middleware/validation';
import type { AuthSession, AuthUser } from '@/internal/services/auth';
import type { DriverService } from '@/internal/services/driver';
import { created, success } from '@/internal/utils/response';
import { CreateDriverIssueSchema, IdParamSchema, UpdateDriverLocationSchema } from '@/internal/utils/validation';

type AuthEnv = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

export function createDriverHandler(
  driverService: DriverService,
  authMiddleware: (allowedRoles: string[]) => MiddlewareHandler<AuthEnv>,
): Hono<AuthEnv> {
  const driver = new Hono<AuthEnv>();

  driver.use('*', authMiddleware(['driver']));

  driver.get('/route/current', async (c) => {
    const user = c.get('user');
    const route = await driverService.getCurrentRoute(user.id);
    return success(c, route);
  });

  driver.post('/assignments/:id/start', validateParam(IdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    await driverService.startAssignment(id, user.id);
    return success(c, { success: true });
  });

  driver.post('/assignments/:id/complete', validateParam(IdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    await driverService.completeAssignment(id, user.id);
    return success(c, { success: true });
  });

  driver.post('/location', validateJson(UpdateDriverLocationSchema), async (c) => {
    const locationData = c.req.valid('json');
    const user = c.get('user');
    await driverService.updateLocation(user.id, locationData);
    return success(c, { success: true });
  });

  driver.post('/issues', validateJson(CreateDriverIssueSchema), async (c) => {
    const issueData = c.req.valid('json');
    const user = c.get('user');
    await driverService.reportIssue(user.id, issueData);
    return created(c, { message: 'Issue reported successfully' });
  });

  return driver;
}
