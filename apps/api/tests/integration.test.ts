import { test, expect, beforeEach, afterAll } from 'bun:test';
import { setupTest, type TestContext } from './helpers/test-setup.ts';

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setupTest();
});

test('complete workflow: admin creates resources, driver gets assignment', async () => {
  // preparing: setup users
  await ctx.auth.loginAs('admin');
  const driverSession = await ctx.auth.loginAs('driver');

  const adminHeaders = ctx.auth.getHeaders('admin');
  const driverHeaders = ctx.auth.getHeaders('driver');

  // 1. admin creates truck
  const truckResponse = await ctx.client.post(
    '/admin/trucks',
    {
      name: 'Integration Test Truck',
      license_plate: `I${Date.now().toString().slice(-8)}`,
    },
    adminHeaders,
  );

  expect(truckResponse.status).toBe(201);
  const truck = truckResponse.data;

  // 2. admin creates route
  const routeResponse = await ctx.client.post(
    '/admin/routes',
    {
      name: 'Integration Test Route',
      description: 'Test route for integration',
      start_lat: -12.0464,
      start_lng: -77.0428,
      estimated_duration_minutes: 60,
      waypoints: [
        { lat: -12.0464, lng: -77.0428, sequence_order: 1 },
        { lat: -12.05, lng: -77.04, sequence_order: 2 },
      ],
    },
    adminHeaders,
  );

  expect(routeResponse.status).toBe(201);
  const route = routeResponse.data;

  // 3. admin creates assignment
  const assignmentResponse = await ctx.client.post(
    '/admin/assignments',
    {
      route_id: route.id,
      truck_id: truck.id,
      driver_id: driverSession.user.id,
      scheduled_start_time: new Date().toISOString(),
      scheduled_end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Integration test assignment',
    },
    adminHeaders,
  );

  expect(assignmentResponse.status).toBe(201);

  // 4. driver can see current route
  const currentRouteResponse = await ctx.client.get('/driver/route/current', driverHeaders);

  expect(currentRouteResponse.status).toBe(200);
  expect(currentRouteResponse.data).toMatchObject({
    route_name: route.name,
    truck_name: truck.name,
    status: 'scheduled',
  });
});

test('citizen can report issue and admin can view it', async () => {
  await ctx.auth.loginAs('citizen');
  await ctx.auth.loginAs('admin');

  const citizenHeaders = ctx.auth.getHeaders('citizen');
  const adminHeaders = ctx.auth.getHeaders('admin');

  const issueResponse = await ctx.client.post(
    '/citizen/issues',
    {
      type: 'missed_collection',
      description: 'Garbage not collected today',
      lat: -12.0464,
      lng: -77.0428,
    },
    citizenHeaders,
  );

  expect(issueResponse.status).toBe(201);

  // admin can view issues
  const adminIssuesResponse = await ctx.client.get('/admin/issues', adminHeaders);

  expect(adminIssuesResponse.status).toBe(200);
  expect(Array.isArray(adminIssuesResponse.data)).toBe(true);
});

test('role-based access control works across endpoints', async () => {
  await ctx.auth.loginAs('citizen');
  await ctx.auth.loginAs('driver');
  await ctx.auth.loginAs('admin');

  const citizenHeaders = ctx.auth.getHeaders('citizen');
  const driverHeaders = ctx.auth.getHeaders('driver');
  const adminHeaders = ctx.auth.getHeaders('admin');

  // citizen cannot access admin endpoints
  const citizenToAdmin = await ctx.client.get('/admin/trucks', citizenHeaders);
  expect(citizenToAdmin.status).toBe(403);

  // citizen cannot access driver endpoints
  const citizenToDriver = await ctx.client.get('/driver/route/current', citizenHeaders);
  expect(citizenToDriver.status).toBe(403);

  // driver cannot access admin endpoints
  const driverToAdmin = await ctx.client.get('/admin/trucks', driverHeaders);
  expect(driverToAdmin.status).toBe(403);

  // admin can access admin endpoints
  const adminToAdmin = await ctx.client.get('/admin/trucks', adminHeaders);
  expect(adminToAdmin.status).toBe(200);
});

afterAll(async () => {
  await ctx.db.close();
});
