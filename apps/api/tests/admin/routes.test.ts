import { test, expect } from 'bun:test';
import { apiRequest, login, expectValidId } from '../helpers';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from '../config';

let adminCookie: string;
let routeId: any;

test('setup admin session for routes', async () => {
  adminCookie = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');
  expect(adminCookie).toBeDefined();
});

test('create route', async () => {
  const { response, data } = await apiRequest('/admin/routes', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: JSON.stringify({
      name: 'Downtown Route',
      description: 'Main downtown collection route',
      start_lat: -12.0464,
      start_lng: -77.0428,
      estimated_duration_minutes: 120,
      waypoints: [
        { lat: -12.0464, lng: -77.0428, sequence_order: 1 },
        { lat: -12.05, lng: -77.04, sequence_order: 2 },
      ],
    }),
  });

  console.log('Create route response:', data);

  expect(response.status).toBe(201);
  expect(data).toBeDefined();

  routeId = data?.id || data?.route_id || data;
  expectValidId(routeId);
});

test('get routes list', async () => {
  const { response, data } = await apiRequest('/admin/routes', {
    headers: { Cookie: adminCookie },
  });

  console.log('Get routes response:', data);

  expect(response.status).toBe(200);
  expect(data).toBeDefined();
});

test('create route with invalid coordinates fails', async () => {
  const { response, data } = await apiRequest('/admin/routes', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: JSON.stringify({
      name: 'Invalid Route',
      description: 'Route with invalid coordinates',
      start_lat: 999, // Invalid latitude
      start_lng: 999, // Invalid longitude
      estimated_duration_minutes: 120,
      waypoints: [],
    }),
  });

  console.log('Create invalid route response:', data);

  expect(response.status).toBeGreaterThanOrEqual(400);
});

export { routeId };
