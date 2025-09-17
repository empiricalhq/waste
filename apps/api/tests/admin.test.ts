import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { HTTP_STATUS } from './config';
import { setupTest, type TestContext } from './setup';

// Define expected response shapes
interface Truck {
  id: string;
  name: string;
  license_plate: string;
}
interface Route {
  id: string;
  name: string;
}
interface SuccessResponse<T> {
  data: T;
}
interface ErrorResponse {
  error: string;
}

describe('Admin API - Trucks', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
    await ctx.auth.loginAs('admin');
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  test('should create a new truck', async () => {
    const truckData = {
      name: 'Garbage Truck 007',
      license_plate: `T${Date.now().toString().substring(5)}`,
    };
    const response = await ctx.client.post<SuccessResponse<Truck>>(
      '/admin/trucks',
      truckData,
      ctx.auth.getHeaders('admin'),
    );

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.data.data).toMatchObject({
      id: expect.any(String),
      name: truckData.name,
      license_plate: truckData.license_plate,
    });
  });

  test('should fail to create a truck with a duplicate license plate', async () => {
    const truckData = { name: 'Garbage Truck 008', license_plate: 'DUPLICATE' };
    await ctx.client.post('/admin/trucks', truckData, ctx.auth.getHeaders('admin'));

    const response = await ctx.client.post<ErrorResponse>('/admin/trucks', truckData, ctx.auth.getHeaders('admin'));
    expect(response.status).toBe(HTTP_STATUS.CONFLICT);
    expect(response.data.error).toBe('License plate already exists');
  });

  test('should list all active trucks', async () => {
    await ctx.client.post(
      '/admin/trucks',
      { name: 'Listable Truck', license_plate: `L${Date.now().toString().substring(5)}` },
      ctx.auth.getHeaders('admin'),
    );

    const response = await ctx.client.get<SuccessResponse<Truck[]>>('/admin/trucks', ctx.auth.getHeaders('admin'));
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });
});

describe('Admin API - Routes', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
    await ctx.auth.loginAs('admin');
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  test('should create a new route with waypoints', async () => {
    const routeData = {
      name: 'Downtown Route',
      description: 'Main route for the city center.',
      start_lat: -12.04,
      start_lng: -77.04,
      estimated_duration_minutes: 90,
      waypoints: [
        { lat: -12.04, lng: -77.04, sequence_order: 1 },
        { lat: -12.05, lng: -77.03, sequence_order: 2 },
      ],
    };
    const response = await ctx.client.post<SuccessResponse<Route>>(
      '/admin/routes',
      routeData,
      ctx.auth.getHeaders('admin'),
    );
    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.data.data).toMatchObject({
      id: expect.any(String),
      name: routeData.name,
    });
  });
});

describe('Admin API - Authorization', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
    await ctx.auth.loginAs('admin');
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  test('should forbid access from non-admin users', async () => {
    await ctx.auth.loginAs('citizen');
    const response = await ctx.client.get('/admin/trucks', ctx.auth.getHeaders('citizen'));
    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
