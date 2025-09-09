import { test, expect } from 'bun:test';
import { apiRequest, login, expectValidId } from '../helpers';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from '../config';

let adminCookie: string;
let truckId: any;

test('setup admin session', async () => {
  adminCookie = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');
  expect(adminCookie).toBeDefined();
});

test('create truck', async () => {
  const { response, data } = await apiRequest('/admin/trucks', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: JSON.stringify({
      name: 'Test Truck 1',
      license_plate: 'ABC-123',
    }),
  });

  console.log('Create truck response:', data);

  expect(response.status).toBe(201);
  expect(data).toBeDefined();

  truckId = data?.id || data?.truck_id || data;
  expectValidId(truckId);
});

test('get trucks list', async () => {
  const { response, data } = await apiRequest('/admin/trucks', {
    headers: { Cookie: adminCookie },
  });

  console.log('Get trucks response:', data);

  expect(response.status).toBe(200);
  expect(data).toBeDefined();
});

test('create truck with missing data fails', async () => {
  const { response, data } = await apiRequest('/admin/trucks', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: JSON.stringify({
      name: 'Incomplete Truck',
      // Missing license_plate
    }),
  });

  console.log('Create incomplete truck response:', data);

  expect(response.status).toBeGreaterThanOrEqual(400);
});

test('create truck without auth fails', async () => {
  const { response, data } = await apiRequest('/admin/trucks', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Unauthorized Truck',
      license_plate: 'XYZ-999',
    }),
  });

  expect(response.status).toBe(401);
});

export { truckId };
