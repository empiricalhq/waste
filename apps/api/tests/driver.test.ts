import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { HTTP_STATUS } from './config';
import { setupTest, type TestContext } from './setup';

interface ErrorResponse {
  error: string;
}

describe('Driver API', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
    await ctx.auth.loginAs('driver');
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  test('should return 404 when no route is assigned', async () => {
    const response = await ctx.client.get<ErrorResponse>('/driver/route/current', ctx.auth.getHeaders('driver'));
    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(response.data.error).toBe('No upcoming or active route found');
  });

  test('should return 400 when updating location without an active assignment', async () => {
    const locationData = { lat: -12.0464, lng: -77.0428 };
    const response = await ctx.client.post<ErrorResponse>(
      '/driver/location',
      locationData,
      ctx.auth.getHeaders('driver'),
    );
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.data.error).toBe('No active assignment found for location update');
  });

  test('should return 400 when reporting an issue without an active assignment', async () => {
    const issueData = { type: 'road_blocked', lat: -12.04, lng: -77.04 };
    const response = await ctx.client.post<ErrorResponse>('/driver/issues', issueData, ctx.auth.getHeaders('driver'));
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.data.error).toBe('No active assignment found to report an issue');
  });

  test('should forbid access from non-driver users', async () => {
    await ctx.auth.loginAs('citizen');
    const response = await ctx.client.get('/driver/route/current', ctx.auth.getHeaders('citizen'));
    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
