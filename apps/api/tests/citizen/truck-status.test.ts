import { test, expect } from 'bun:test';
import { apiRequest, login } from '../helpers';
import { TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD } from '../config';

let citizenCookie: string;

test('setup citizen session for truck status', async () => {
  citizenCookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');
  expect(citizenCookie).toBeDefined();
});

test('get truck status', async () => {
  const { response, data } = await apiRequest('/citizen/truck/status', {
    headers: { Cookie: citizenCookie },
  });

  console.log('Truck status response:', response.status, data);

  expect(response.status).toBeLessThan(500);
});

test('get truck status without auth fails', async () => {
  const { response, data } = await apiRequest('/citizen/truck/status');

  expect(response.status).toBe(401);
});
