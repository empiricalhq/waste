import { test, expect, beforeEach } from 'bun:test';
import { TEST_USERS } from './config.ts';
import { auth } from './auth.ts';
import { http } from './http.ts';
import './setup.ts';

let adminHeaders: Record<string, string>;

beforeEach(async () => {
  await auth.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  adminHeaders = auth.getAuthHeaders(TEST_USERS.admin.email);
});

test('admin can create truck', async () => {
  const truckData = {
    name: 'Test Truck',
    license_plate: `T${Date.now().toString().slice(-8)}`,
  };

  const response = await http.post('/admin/trucks', truckData, adminHeaders);

  expect(response.status).toBe(201);
  expect(response.data).toMatchObject({
    id: expect.any(String),
    name: truckData.name,
    license_plate: truckData.license_plate,
  });
});

test('admin can list trucks', async () => {
  await http.post(
    '/admin/trucks',
    {
      name: 'Test Truck',
      license_plate: `L${Date.now().toString().slice(-8)}`,
    },
    adminHeaders,
  );

  const response = await http.get('/admin/trucks', adminHeaders);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

test('admin cannot create truck with duplicate license plate', async () => {
  const truckData = {
    name: 'Test Truck',
    license_plate: 'DUPLICATE',
  };

  // before: create a truck
  await http.post('/admin/trucks', truckData, adminHeaders);

  // then: try to create duplicate
  const response = await http.post('/admin/trucks', truckData, adminHeaders);

  expect(response.status).toBe(409);
  expect(response.data.error).toContain('License plate already exists');
});

test('admin can create route with waypoints', async () => {
  const routeData = {
    name: 'Ruta del Centro de Lima',
    description: 'Ruta principal por el centro de Lima',
    start_lat: -12.0464,
    start_lng: -77.0428,
    estimated_duration_minutes: 120,
    waypoints: [
      { lat: -12.0464, lng: -77.0428, sequence_order: 1 },
      { lat: -12.05, lng: -77.04, sequence_order: 2 },
    ],
  };

  const response = await http.post('/admin/routes', routeData, adminHeaders);

  expect(response.status).toBe(201);
  expect(response.data).toMatchObject({
    id: expect.any(String),
    name: routeData.name,
    description: routeData.description,
  });
});

test('admin can list drivers', async () => {
  await auth.login(TEST_USERS.driver.email, TEST_USERS.driver.password);

  const response = await http.get('/admin/drivers', adminHeaders);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
});

test('non-admin cannot access admin endpoints', async () => {
  await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);
  const citizenHeaders = auth.getAuthHeaders(TEST_USERS.citizen.email);

  const response = await http.get('/admin/trucks', citizenHeaders);

  expect(response.status).toBe(403);
});
