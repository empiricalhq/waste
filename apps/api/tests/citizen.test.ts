import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { HTTP_STATUS } from './config';
import { setupTest, type TestContext } from './setup';

interface SuccessResponse<T> {
  data: T;
}

interface Issue {
  type: string;
}

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setupTest();
  await ctx.auth.loginAs('citizen');
});

afterAll(async () => {
  await ctx.db.close();
});

describe('Citizen Profile', () => {
  test('should update citizen profile location', async () => {
    const location = { lat: -12.0464, lng: -77.0428 };
    const response = await ctx.client.put<SuccessResponse<{ success: boolean }>>(
      '/citizen/profile/location',
      location,
      ctx.auth.getHeaders('citizen'),
    );

    expect(response.status).toBe(HTTP_STATUS.OK);

    const { success } = response.data.data;
    expect(success).toBe(true);
  });
});

describe('Citizen Truck Status', () => {
  test('should prompt for location when checking truck status if not set', async () => {
    const response = await ctx.client.get<SuccessResponse<{ status: string }>>(
      '/citizen/truck/status',
      ctx.auth.getHeaders('citizen'),
    );

    expect(response.status).toBe(HTTP_STATUS.OK);

    const { status } = response.data.data;
    expect(status).toBe('LOCATION_NOT_SET');
  });
});

describe('Citizen Issues', () => {
  test('should report an issue', async () => {
    const issueData = {
      type: 'missed_collection',
      description: 'My garbage was not collected.',
      lat: -12.1,
      lng: -77.1,
    };
    const response = await ctx.client.post<SuccessResponse<{ message: string }>>(
      '/citizen/issues',
      issueData,
      ctx.auth.getHeaders('citizen'),
    );

    expect(response.status).toBe(HTTP_STATUS.CREATED);

    const { message } = response.data.data;
    expect(message).toContain('Issue reported successfully');
  });

  test('should list own reported issues', async () => {
    await ctx.client.post(
      '/citizen/issues',
      { type: 'missed_collection', lat: -12.1, lng: -77.1 },
      ctx.auth.getHeaders('citizen'),
    );

    const response = await ctx.client.get<SuccessResponse<Issue[]>>('/citizen/issues', ctx.auth.getHeaders('citizen'));

    expect(response.status).toBe(HTTP_STATUS.OK);

    const issues = response.data.data;
    expect(issues).toHaveLength(1);
    expect(issues[0]?.type).toBe('missed_collection');
  });
});

describe('Citizen Access Control', () => {
  test('should forbid access from staff (non-citizen) users', async () => {
    await ctx.auth.loginAs('admin');

    const response = await ctx.client.get('/citizen/truck/status', ctx.auth.getHeaders('admin'));

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
