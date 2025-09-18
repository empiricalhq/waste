import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { BaseTest } from './base-test';
import { HTTP_STATUS } from './config';
import type { SuccessResponse } from './types';
import { createTestRoute, createTestTruck } from './utils';

describe('E2E Workflows', () => {
  const baseTest = new BaseTest();

  beforeEach(async () => {
    await baseTest.setup();
  });

  afterAll(async () => {
    await baseTest.teardown();
  });

  test('Complete assignment workflow', async () => {
    // login users
    const _adminSession = await baseTest.ctx.auth.loginAs('admin');
    const driverSession = await baseTest.ctx.auth.loginAs('driver');

    // admin: creates truck
    const truckRes = await baseTest.ctx.client.post<SuccessResponse<{ id: string }>>(
      '/admin/trucks',
      createTestTruck('Workflow truck'),
      baseTest.ctx.auth.getHeaders('admin'),
    );
    expect(truckRes.status).toBe(HTTP_STATUS.CREATED);
    const truckId = truckRes.data.data.id;

    // admin: creates route
    const routeRes = await baseTest.ctx.client.post<SuccessResponse<{ id: string }>>(
      '/admin/routes',
      createTestRoute('Workflow route'),
      baseTest.ctx.auth.getHeaders('admin'),
    );
    expect(routeRes.status).toBe(HTTP_STATUS.CREATED);
    const routeId = routeRes.data.data.id;

    // admin: creates assignment
    const MS = 1000;
    const assignmentRes = await baseTest.ctx.client.post<SuccessResponse<{ id: string }>>(
      '/admin/assignments',
      {
        route_id: routeId,
        truck_id: truckId,
        driver_id: driverSession.user.id,
        scheduled_start_time: new Date().toISOString(),
        scheduled_end_time: new Date(Date.now() + 2 * 60 * 60 * MS).toISOString(),
      },
      baseTest.ctx.auth.getHeaders('admin'),
    );
    expect(assignmentRes.status).toBe(HTTP_STATUS.CREATED);
    const assignmentId = assignmentRes.data.data.id;

    // driver: sees assignment
    const currentRouteRes = await baseTest.ctx.client.get<SuccessResponse<{ id: string; status: string }>>(
      '/driver/route/current',
      baseTest.ctx.auth.getHeaders('driver'),
    );
    expect(currentRouteRes.status).toBe(HTTP_STATUS.OK);
    expect(currentRouteRes.data.data.status).toBe('scheduled');
    expect(currentRouteRes.data.data.id).toBe(assignmentId);

    // driver: starts assignment
    const startRes = await baseTest.ctx.client.post(
      `/driver/assignments/${assignmentId}/start`,
      {},
      baseTest.ctx.auth.getHeaders('driver'),
    );
    expect(startRes.status).toBe(HTTP_STATUS.OK);

    // driver: updates location
    const locationRes = await baseTest.ctx.client.post(
      '/driver/location',
      { lat: -12.01, lng: -77.01, speed: 50 },
      baseTest.ctx.auth.getHeaders('driver'),
    );
    expect(locationRes.status).toBe(HTTP_STATUS.OK);

    // driver: completes assignment
    const completeRes = await baseTest.ctx.client.post(
      `/driver/assignments/${assignmentId}/complete`,
      {},
      baseTest.ctx.auth.getHeaders('driver'),
    );
    expect(completeRes.status).toBe(HTTP_STATUS.OK);

    // no more active assignments
    const finalRes = await baseTest.ctx.client.get('/driver/route/current', baseTest.ctx.auth.getHeaders('driver'));
    expect(finalRes.status).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
