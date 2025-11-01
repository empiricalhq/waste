import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { BaseTest } from './base-test';
import { HTTP_STATUS } from './config';
import type { ErrorResponse, Route, SuccessResponse, Truck } from './types';
import { createTestRoute, createTestTruck } from './utils';

describe('Admin API', () => {
  const baseTest = new BaseTest();

  beforeEach(async () => {
    await baseTest.setup();
    await baseTest.ctx.auth.loginAs('admin');
  });

  afterAll(async () => {
    await baseTest.teardown();
  });

  describe('Trucks', () => {
    test('should create a new truck', async () => {
      const truckData = createTestTruck('Test Truck 1');

      const response = await baseTest.ctx.client.post<SuccessResponse<Truck>>(
        '/admin/trucks',
        truckData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.data.data).toMatchObject({
        id: expect.any(String),
        name: truckData.name,
        license_plate: truckData.license_plate,
      });
    });

    test('should fail with duplicate license plate', async () => {
      const truckData = { name: 'Test Truck', license_plate: 'DUPLICATE' };

      // create first truck
      await baseTest.ctx.client.post('/admin/trucks', truckData, baseTest.ctx.auth.getHeaders('admin'));

      // try to create duplicate
      const response = await baseTest.ctx.client.post<ErrorResponse>(
        '/admin/trucks',
        truckData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.data.error).toBe('Resource already exists');
    });

    test('should list all trucks', async () => {
      await baseTest.ctx.client.post(
        '/admin/trucks',
        createTestTruck('Listable Truck'),
        baseTest.ctx.auth.getHeaders('admin'),
      );

      const response = await baseTest.ctx.client.get<SuccessResponse<Truck[]>>(
        '/admin/trucks',
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Routes', () => {
    test('should create a new route with waypoints', async () => {
      const routeData = createTestRoute('Downtown Route');

      const response = await baseTest.ctx.client.post<SuccessResponse<Route>>(
        '/admin/routes',
        routeData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.data.data).toMatchObject({
        id: expect.any(String),
        name: routeData.name,
      });
    });
  });

  describe('Authorization', () => {
    test('should forbid non-admin users', async () => {
      await baseTest.ctx.auth.loginAs('citizen');

      const response = await baseTest.ctx.client.get('/admin/trucks', baseTest.ctx.auth.getHeaders('citizen'));

      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    });
  });

  describe('User Management', () => {
    test('should create a new user with admin role', async () => {
      const userData = {
        name: 'Test Admin User',
        email: 'testadmin@example.com',
        password: 'TestPass123',
        role: 'admin',
      };

      const response = await baseTest.ctx.client.post<SuccessResponse<{ id: string; name: string; email: string; role: string }>>(
        '/admin/users',
        userData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.data.data).toMatchObject({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        role: 'admin',
      });
    });

    test('should create a new user with supervisor role', async () => {
      const userData = {
        name: 'Test Supervisor User',
        email: 'testsupervisor@example.com',
        password: 'TestPass123',
        role: 'supervisor',
      };

      const response = await baseTest.ctx.client.post<SuccessResponse<{ id: string; name: string; email: string; role: string }>>(
        '/admin/users',
        userData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.data.data).toMatchObject({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        role: 'supervisor',
      });
    });

    test('should create a new user with driver role', async () => {
      const userData = {
        name: 'Test Driver User',
        email: 'testdriver@example.com',
        password: 'TestPass123',
        role: 'driver',
      };

      const response = await baseTest.ctx.client.post<SuccessResponse<{ id: string; name: string; email: string; role: string }>>(
        '/admin/users',
        userData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.data.data).toMatchObject({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        role: 'driver',
      });
    });

    test('should reject invalid role', async () => {
      const userData = {
        name: 'Test User',
        email: 'testinvalid@example.com',
        password: 'TestPass123',
        role: 'invalid_role',
      };

      const response = await baseTest.ctx.client.post<ErrorResponse>(
        '/admin/users',
        userData,
        baseTest.ctx.auth.getHeaders('admin'),
      );

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    });
  });
});
