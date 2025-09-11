import { test, expect, beforeEach } from 'bun:test';
import { TEST_USERS } from './config.ts';
import { auth } from './auth.ts';
import { http } from './http.ts';
import { setup } from './setup.ts';

let citizenHeaders: Record<string, string>;

beforeEach(async () => {
  await setup();
  await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);
  citizenHeaders = auth.getAuthHeaders(TEST_USERS.citizen.email);
});

test('citizen can update location', async () => {
  const locationData = {
    lat: -12.0464,
    lng: -77.0428,
  };

  const response = await http.put('/citizen/profile/location', locationData, citizenHeaders);

  expect(response.status).toBe(200);
  expect(response.data.success).toBe(true);
});

test('citizen cannot update location with invalid coordinates', async () => {
  const locationData = {
    lat: 999,
    lng: 999,
  };

  const response = await http.put('/citizen/profile/location', locationData, citizenHeaders);

  expect(response.status).toBe(400);
});

test('citizen can check truck status', async () => {
  await http.put(
    '/citizen/profile/location',
    {
      lat: -12.0464,
      lng: -77.0428,
    },
    citizenHeaders,
  );

  const response = await http.get('/citizen/truck/status', citizenHeaders);

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('status');
});

test('citizen gets location prompt when location not set', async () => {
  const response = await http.get('/citizen/truck/status', citizenHeaders);

  expect(response.status).toBe(200);
  expect(response.data.status).toBe('LOCATION_NOT_SET');
});

test('citizen can report issues', async () => {
  const issueData = {
    type: 'missed_collection',
    description: 'Truck did not collect garbage',
    lat: -12.0464,
    lng: -77.0428,
  };

  const response = await http.post('/citizen/issues', issueData, citizenHeaders);

  expect(response.status).toBe(201);
  expect(response.data.message).toContain('Issue reported successfully');
});

test('citizen can list their own issues', async () => {
  await http.post(
    '/citizen/issues',
    {
      type: 'missed_collection',
      description: 'Test issue',
      lat: -12.0464,
      lng: -77.0428,
    },
    citizenHeaders,
  );

  const response = await http.get('/citizen/issues', citizenHeaders);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

test('non-citizen cannot access citizen endpoints', async () => {
  await auth.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  const adminHeaders = auth.getAuthHeaders(TEST_USERS.admin.email);

  const response = await http.get('/citizen/truck/status', adminHeaders);

  expect(response.status).toBe(403);
});
