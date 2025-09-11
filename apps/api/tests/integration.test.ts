import { test, expect, beforeEach } from 'bun:test';
import { TEST_USERS } from './config.ts';
import { auth } from './auth.ts';
import { http } from './http.ts';
import './setup.ts';

test('full workflow: admin creates truck and route, driver gets assignment', async () => {
  // before: setup users
  await auth.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  const driverSession = await auth.login(TEST_USERS.driver.email, TEST_USERS.driver.password);

  const adminHeaders = auth.getAuthHeaders(TEST_USERS.admin.email);
  const driverHeaders = auth.getAuthHeaders(TEST_USERS.driver.email);

  // 1. admin creates truck
  const truckResponse = await http.post(
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
  const routeResponse = await http.post(
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
  const assignmentResponse = await http.post(
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

  // 4. driver can now see current route
  const currentRouteResponse = await http.get('/driver/route/current', driverHeaders);

  expect(currentRouteResponse.status).toBe(200);
  expect(currentRouteResponse.data).toMatchObject({
    route_name: route.name,
    truck_name: truck.name,
    status: 'scheduled',
  });
});
