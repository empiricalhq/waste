import { afterAll, beforeEach, expect, test } from 'bun:test';
import { setupTest, type TestContext } from './helpers/test-setup.ts';

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setupTest();
  await ctx.auth.loginAs('citizen');
});

test('citizen can update location', async () => {
  const locationData = {
    lat: -12.0464,
    lng: -77.0428,
  };

  const response = await ctx.client.put('/citizen/profile/location', locationData, ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(200);
  expect(response.data.success).toBe(true);
});

test('citizen cannot use invalid coordinates', async () => {
  const invalidLocation = {
    lat: 999,
    lng: 999,
  };

  const response = await ctx.client.put('/citizen/profile/location', invalidLocation, ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(400);
});

test('citizen gets location prompt when location not set', async () => {
  const response = await ctx.client.get('/citizen/truck/status', ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(200);
  expect(response.data.status).toBe('LOCATION_NOT_SET');
});

test('citizen can check truck status after setting location', async () => {
  await ctx.client.put(
    '/citizen/profile/location',
    {
      lat: -12.0464,
      lng: -77.0428,
    },
    ctx.auth.getHeaders('citizen'),
  );

  const response = await ctx.client.get('/citizen/truck/status', ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('status');
});

test('citizen can report issues', async () => {
  const issueData = {
    type: 'missed_collection',
    description: 'Truck did not collect garbage',
    lat: -12.0464,
    lng: -77.0428,
  };

  const response = await ctx.client.post('/citizen/issues', issueData, ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(201);
  expect(response.data.message).toContain('Issue reported successfully');
});

test('citizen can list their issues', async () => {
  await ctx.client.post(
    '/citizen/issues',
    {
      type: 'missed_collection',
      description: 'Test issue',
      lat: -12.0464,
      lng: -77.0428,
    },
    ctx.auth.getHeaders('citizen'),
  );

  const response = await ctx.client.get('/citizen/issues', ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

test('non-citizen cannot access citizen endpoints', async () => {
  await ctx.auth.loginAs('admin');

  const response = await ctx.client.get('/citizen/truck/status', ctx.auth.getHeaders('admin'));

  expect(response.status).toBe(403);
});

afterAll(async () => {
  await ctx.db.close();
});
