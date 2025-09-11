import { test, expect, beforeEach } from 'bun:test';
import { setupTest, type TestContext } from './helpers/test-setup.ts';

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setupTest();
  await ctx.auth.loginAs('driver');
});

test('driver gets 404 when no route assigned', async () => {
  const response = await ctx.client.get('/driver/route/current', ctx.auth.getHeaders('driver'));

  expect(response.status).toBe(404);
  expect(response.data.error).toContain('No upcoming or active route found');
});

test('driver cannot update location without active assignment', async () => {
  const locationData = {
    lat: -12.0464,
    lng: -77.0428,
    speed: 25.5,
    heading: 180,
  };

  const response = await ctx.client.post('/driver/location', locationData, ctx.auth.getHeaders('driver'));

  expect(response.status).toBe(500);
  expect(response.data.error).toContain('Failed to update location');
});

test('driver cannot report issues without active assignment', async () => {
  const issueData = {
    type: 'mechanical_failure',
    notes: 'Engine overheating',
    lat: -12.0464,
    lng: -77.0428,
  };

  const response = await ctx.client.post('/driver/issues', issueData, ctx.auth.getHeaders('driver'));

  expect(response.status).toBe(400);
  expect(response.data.error).toContain('No active assignment found');
});

test('non-driver cannot access driver endpoints', async () => {
  await ctx.auth.loginAs('citizen');

  const response = await ctx.client.get('/driver/route/current', ctx.auth.getHeaders('citizen'));

  expect(response.status).toBe(403);
});
