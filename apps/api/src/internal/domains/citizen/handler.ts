import { Hono, type MiddlewareHandler } from 'hono';
import { created, success } from '@/internal/shared/utils/response';
import { validateJson } from '@/internal/shared/utils/validation';
import type { AuthEnv } from '../auth/types';
import { CreateCitizenIssueSchema } from '../issues/schemas';
import { UpdateLocationSchema } from '../locations/schemas';
import type { CitizenService } from './service';

export function createCitizenHandler(
  citizenService: CitizenService,
  citizenOnlyMiddleware: MiddlewareHandler<AuthEnv>,
): Hono<AuthEnv> {
  const citizen = new Hono<AuthEnv>();

  citizen.use('*', citizenOnlyMiddleware);

  citizen.get('/truck/status', async (c) => {
    const user = c.get('user');
    const status = await citizenService.getTruckStatus(user.id);
    return success(c, status);
  });

  citizen.put('/profile/location', validateJson(UpdateLocationSchema), async (c) => {
    const { lat, lng } = c.req.valid('json');
    const user = c.get('user');
    await citizenService.updateLocation(user.id, lat, lng);
    return success(c, { success: true });
  });

  citizen.post('/issues', validateJson(CreateCitizenIssueSchema), async (c) => {
    const issueData = c.req.valid('json');
    const user = c.get('user');
    await citizenService.reportIssue(user.id, issueData);
    return created(c, { message: 'Issue reported successfully' });
  });

  citizen.get('/issues', async (c) => {
    const user = c.get('user');
    const issues = await citizenService.getUserIssues(user.id);
    return success(c, issues);
  });

  return citizen;
}
