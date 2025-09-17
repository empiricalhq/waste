import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { HTTP_STATUS } from './config';
import { setupTest, type TestContext } from './setup';

interface SuccessResponse<T> {
  data: T;
}

const MILLISECONDS_PER_SECOND = 1000;
const E2E_TEST_TIMEOUT_MS = 20_000;

const generateTestLicensePlate = (prefix: string): string => {
  const TIMESTAMP_START_INDEX = 5;
  return `${prefix}${Date.now().toString().substring(TIMESTAMP_START_INDEX)}`;
};

async function loginUsers(ctx: TestContext) {
  const adminHeaders = (await ctx.auth.loginAs('admin')).cookie;
  const driverSession = await ctx.auth.loginAs('driver');
  return { adminHeaders, driverSession, driverHeaders: driverSession.cookie };
}

async function createTruck(ctx: TestContext, adminHeaders: string) {
  return ctx.client.post<SuccessResponse<{ id: string }>>(
    '/admin/trucks',
    { name: 'Workflow Truck', license_plate: generateTestLicensePlate('W') },
    { Cookie: adminHeaders },
  );
}

async function createRoute(ctx: TestContext, adminHeaders: string) {
  return ctx.client.post<SuccessResponse<{ id: string }>>(
    '/admin/routes',
    {
      name: 'Workflow Route',
      start_lat: -12,
      start_lng: -77,
      estimated_duration_minutes: 60,
      waypoints: [{ lat: -12, lng: -77, sequence_order: 1 }],
    },
    { Cookie: adminHeaders },
  );
}

async function assignRoute(ctx: TestContext, adminHeaders: string, truckId: string, routeId: string, driverId: string) {
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * MILLISECONDS_PER_SECOND).toISOString();
  return ctx.client.post<SuccessResponse<{ id: string }>>(
    '/admin/assignments',
    {
      route_id: routeId,
      truck_id: truckId,
      driver_id: driverId,
      scheduled_start_time: new Date().toISOString(),
      scheduled_end_time: twoHoursFromNow,
    },
    { Cookie: adminHeaders },
  );
}

async function getCurrentDriverRoute(ctx: TestContext, driverHeaders: string) {
  return ctx.client.get<SuccessResponse<{ id: string; status: string }>>('/driver/route/current', {
    Cookie: driverHeaders,
  });
}

async function startAssignment(ctx: TestContext, driverHeaders: string, assignmentId: string) {
  return ctx.client.post(`/driver/assignments/${assignmentId}/start`, {}, { Cookie: driverHeaders });
}

async function updateDriverLocation(ctx: TestContext, driverHeaders: string) {
  return ctx.client.post('/driver/location', { lat: -12.01, lng: -77.01, speed: 50 }, { Cookie: driverHeaders });
}

async function completeAssignment(ctx: TestContext, driverHeaders: string, assignmentId: string) {
  return ctx.client.post(`/driver/assignments/${assignmentId}/complete`, {}, { Cookie: driverHeaders });
}

// ----------------- Test Suite -----------------

describe('E2E Workflows', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  test(
    'Admin creates resources, driver starts and completes assignment',
    async () => {
      const { adminHeaders, driverSession, driverHeaders } = await loginUsers(ctx);

      const truckRes = await createTruck(ctx, adminHeaders);
      expect(truckRes.status).toBe(HTTP_STATUS.CREATED);
      const truckId = truckRes.data.data.id;

      const routeRes = await createRoute(ctx, adminHeaders);
      expect(routeRes.status).toBe(HTTP_STATUS.CREATED);
      const routeId = routeRes.data.data.id;

      const assignmentRes = await assignRoute(ctx, adminHeaders, truckId, routeId, driverSession.user.id);
      expect(assignmentRes.status).toBe(HTTP_STATUS.CREATED);
      const assignmentId = assignmentRes.data.data.id;

      // Driver sees scheduled assignment
      const currentRouteRes = await getCurrentDriverRoute(ctx, driverHeaders);
      expect(currentRouteRes.status).toBe(HTTP_STATUS.OK);
      expect(currentRouteRes.data.data.status).toBe('scheduled');
      expect(currentRouteRes.data.data.id).toBe(assignmentId);

      // Driver starts assignment
      const startRes = await startAssignment(ctx, driverHeaders, assignmentId);
      expect(startRes.status).toBe(HTTP_STATUS.OK);

      // Driver updates location
      const locationRes = await updateDriverLocation(ctx, driverHeaders);
      expect(locationRes.status).toBe(HTTP_STATUS.OK);

      // Driver completes assignment
      const completeRes = await completeAssignment(ctx, driverHeaders, assignmentId);
      expect(completeRes.status).toBe(HTTP_STATUS.OK);

      // No active/scheduled route left
      const finalRouteRes = await getCurrentDriverRoute(ctx, driverHeaders);
      expect(finalRouteRes.status).toBe(HTTP_STATUS.NOT_FOUND);
    },
    E2E_TEST_TIMEOUT_MS,
  );
});
