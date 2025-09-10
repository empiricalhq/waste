import { test, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import { apiRequest, cleanTestData } from './helpers';
import { setupTestDatabase, teardownTestDatabase } from './database';
import app from '../src/app.ts';

let server: any = null;

beforeAll(async () => {
  console.log('🚀 Starting test server...');
  
  // Setup test database
  await setupTestDatabase();

  // Start the API server for testing
  const port = 4000;
  server = Bun.serve({
    port,
    fetch: app.fetch,
  });
  
  console.log(`✅ Test server started at http://localhost:${port}`);

  // Give the server a moment to fully start
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  console.log('🛑 Stopping test server...');
  
  // Stop the server
  if (server) {
    server.stop();
    console.log('✅ Test server stopped');
  }
  
  // Clean up test database
  await teardownTestDatabase();
});

beforeEach(async () => {
  await cleanTestData();
});

test('health endpoint returns success', async () => {
  const { response, data } = await apiRequest('/health');

  console.log('Health response data:', data);

  expect(response.status).toBe(200);
  expect(data).toBeDefined();
  
  // More specific assertions about the health response
  if (data) {
    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
    expect(data).toHaveProperty('timestamp');
    console.log('✅ Health endpoint structure validated');
  }
});

test('health endpoint responds quickly', async () => {
  const startTime = Date.now();
  const { response } = await apiRequest('/health');
  const responseTime = Date.now() - startTime;

  expect(response.status).toBe(200);
  expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  
  console.log(`✅ Health endpoint responded in ${responseTime}ms`);
});
