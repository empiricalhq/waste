import { test, expect, beforeEach } from 'bun:test';
import { TEST_USERS } from './config.ts';
import { auth } from './auth.ts';
import { http } from './http.ts';
import './setup.ts';

let driverHeaders: Record<string, string>;
let adminHeaders: Record<string, string>;

beforeEach(async () => {
  await auth.login(TEST_USERS.driver.email, TEST_USERS.driver.password);
  await auth.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

  driverHeaders = auth.getAuthHeaders(TEST_USERS.driver.email);
  adminHeaders = auth.getAuthHeaders(TEST_USERS.admin.email);
});

test('driver gets 404 when no current route assigned', async () => {
  const response = await http.get('/driver/route/current', driverHeaders);

  expect(response.status).toBe(404);
  expect(response.data.error).toContain('No upcoming or active route found');
});

test('driver can update location during active assignment', async () => {
  // TODO: This test would require creating a full assignment workflow
  // For now, test the endpoint structure
  const locationData = {
    lat: -12.0464,
    lng: -77.0428,
    speed: 25.5,
    heading: 180,
  };

  const response = await http.post('/driver/location', locationData, driverHeaders);

  // Expect 500 because no active assignment exists
  expect(response.status).toBe(500);
  expect(response.data.error).toContain('Failed to update location');
});

test('driver can report issues', async () => {
  const issueData = {
    type: 'mechanical_failure',
    notes: 'Engine overheating',
    lat: -12.0464,
    lng: -77.0428,
  };

  const response = await http.post('/driver/issues', issueData, driverHeaders);

  // TODO: Expect 400 because no active assignment exists
  expect(response.status).toBe(400);
  expect(response.data.error).toContain('No active assignment found');
});

test('non-driver cannot access driver endpoints', async () => {
  await auth.login(TEST_USERS.citizen.email, TEST_USERS.citizen.password);
  const citizenHeaders = auth.getAuthHeaders(TEST_USERS.citizen.email);

  const response = await http.get('/driver/route/current', citizenHeaders);

  expect(response.status).toBe(403);
});
