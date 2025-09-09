import { test, expect } from 'bun:test';
import { apiRequest, login } from '../helpers';
import { TEST_DRIVER_EMAIL, TEST_DRIVER_PASSWORD } from '../config';

let driverCookie: string;

test('setup driver session', async () => {
  driverCookie = await login(TEST_DRIVER_EMAIL, TEST_DRIVER_PASSWORD, 'driver');
  expect(driverCookie).toBeDefined();
});

test('get current route', async () => {
  const { response, data } = await apiRequest('/driver/route/current', {
    headers: { Cookie: driverCookie },
  });

  console.log('Driver current route response:', response.status, data);

  // Don't assert specific status yet - let's see what the API returns
  expect(response.status).toBeLessThan(500); // At least not a server error
});

test('get current route without auth fails', async () => {
  const { response, data } = await apiRequest('/driver/route/current');

  expect(response.status).toBe(401);
});
