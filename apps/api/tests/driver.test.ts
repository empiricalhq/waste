import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { BaseTest } from './base-test';
import { HTTP_STATUS } from './config';
import type { ErrorResponse } from './types';

describe('Driver API', () => {
  const baseTest = new BaseTest();

  beforeEach(async () => {
    await baseTest.setup();
    await baseTest.ctx.auth.loginAs('driver');
  });

  afterAll(async () => {
    await baseTest.teardown();
  });

  test('should return 404 when no route assigned', async () => {
    const response = await baseTest.ctx.client.get<ErrorResponse>(
      '/driver/route/current',
      baseTest.ctx.auth.getHeaders('driver'),
    );

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(response.data.error).toBe('No upcoming or active route found');
  });

  test('should return 400 when updating location without assignment', async () => {
    const response = await baseTest.ctx.client.post<ErrorResponse>(
      '/driver/location',
      { lat: -12.0464, lng: -77.0428 },
      baseTest.ctx.auth.getHeaders('driver'),
    );

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.data.error).toBe('No active assignment found for location update');
  });

  test('should return 400 when reporting issue without assignment', async () => {
    const response = await baseTest.ctx.client.post<ErrorResponse>(
      '/driver/issues',
      { type: 'road_blocked', lat: -12.04, lng: -77.04 },
      baseTest.ctx.auth.getHeaders('driver'),
    );

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.data.error).toBe('No active assignment found to report an issue');
  });

  test('should forbid non-driver users', async () => {
    await baseTest.ctx.auth.loginAs('citizen');

    const response = await baseTest.ctx.client.get('/driver/route/current', baseTest.ctx.auth.getHeaders('citizen'));

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
