import { test, expect } from 'bun:test';
import { apiRequest, login } from '../helpers';
import { TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD } from '../config';

let citizenCookie: string;

test('setup citizen session', async () => {
  citizenCookie = await login(TEST_CITIZEN_EMAIL, TEST_CITIZEN_PASSWORD, 'citizen');
  expect(citizenCookie).toBeDefined();
});

test('update citizen location', async () => {
  const { response, data } = await apiRequest('/citizen/profile/location', {
    method: 'PUT',
    headers: { Cookie: citizenCookie },
    body: JSON.stringify({
      lat: -12.0464,
      lng: -77.0428,
    }),
  });

  console.log('Update citizen location response:', response.status, data);

  // Log for now, adjust assertions based on what we see
  expect(response.status).toBeLessThan(500);
});

test('update location with invalid coordinates fails', async () => {
  const { response, data } = await apiRequest('/citizen/profile/location', {
    method: 'PUT',
    headers: { Cookie: citizenCookie },
    body: JSON.stringify({
      lat: 999,
      lng: 999,
    }),
  });

  console.log('Invalid location update response:', response.status, data);

  expect(response.status).toBeGreaterThanOrEqual(400);
});

test('update location without auth fails', async () => {
  const { response, data } = await apiRequest('/citizen/profile/location', {
    method: 'PUT',
    body: JSON.stringify({
      lat: -12.0464,
      lng: -77.0428,
    }),
  });

  expect(response.status).toBe(401);
});
