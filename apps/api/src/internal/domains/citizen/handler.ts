import { Hono, type MiddlewareHandler } from 'hono';
import { z } from 'zod';
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
    const issue = await citizenService.reportIssue(user.id, issueData);
    return created(c, issue);
  });

  citizen.get('/issues', async (c) => {
    const user = c.get('user');
    const issues = await citizenService.getUserIssues(user.id);
    return success(c, issues);
  });

  citizen.get('/collections', async (c) => {
    const user = c.get('user');
    const collections = await citizenService.getCollections(user.id);
    return success(c, collections);
  });

  citizen.get('/report-types', async (c) => {
    const types = citizenService.getReportTypes();
    return success(c, types);
  });

  citizen.get('/quiz/questions', async (c) => {
    const questions = citizenService.getQuizQuestions();
    return success(c, questions);
  });

  citizen.post('/education/progress', validateJson(z.object({
    content_id: z.string(),
    score: z.number(),
  })), async (c) => {
    const { content_id, score } = c.req.valid('json');
    const user = c.get('user');
    await citizenService.updateEducationProgress(user.id, content_id, score);
    return success(c, { success: true });
  });

  return citizen;
}
