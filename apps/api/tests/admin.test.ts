import { test, expect, beforeEach } from 'bun:test';
import { setupTest, type TestContext } from './helpers/test-setup.ts';

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setupTest();
  await ctx.auth.loginAs('admin');
});

test('admin can create truck', async () => {
  const truckData = {
    name: 'Test Truck',
    license_plate: `T${Date.now().toString().slice(-8)}`,
  };

  const response = await ctx.client.post('/admin/trucks', truckData, ctx.auth.getHeaders('admin'));

  expect(response.status).toBe(201);
  expect(response.data).toMatchObject({
    id: expect.any(String),
    name: truckData.name,
    license_plate: truckData.license_plate,
  });
});

test('admin can list trucks', async () => {
  await ctx.client.post(
    '/admin/trucks',
    {
      name: 'Test Truck',
      license_plate: `L${Date.now().toString().slice(-8)}`,
    },
    ctx.auth.getHeaders('admin'),
  );

  const response = await ctx.client.get('/admin/trucks', ctx.auth.getHeaders('admin'));

  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

test('admin cannot create duplicate license plate', async () => {
  const truckData = {
    name: 'Test Truck',
    license_plate: 'DUPLICATE',
  };
  const headers = ctx.auth.getHeaders('admin');

  await ctx.client.post('/admin/trucks', truckData, headers);

  const response = await ctx.client.post('/admin/trucks', truckData, headers);

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

  const response = await ctx.client.post('/admin/routes', routeData, ctx.auth.getHeaders('admin'));

  expect(response.status).toBe(201);
  expect(response.data).toMatchObject({
    id: expect.any(String),
    name: routeData.name,
    description: routeData.description,
  });
});

test('non-admin cannot access admin endpoints', async () => {
  await ctx.auth.loginAs('citizen');

  const response = await ctx.client.get('/admin/trucks', ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(403);
});
