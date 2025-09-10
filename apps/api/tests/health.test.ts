import { test, expect, beforeEach } from 'bun:test';
import { apiRequest, cleanTestData } from './helpers';

beforeEach(async () => {
  await cleanTestData();
});

test('health endpoint returns success', async () => {
  const { response, data } = await apiRequest('/health');

  console.log('Health response data:', data);

  expect(response.status).toBe(200);
  expect(data).toBeDefined();

  if (data) {
    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
    expect(data).toHaveProperty('timestamp');
  }
});

test('health endpoint responds quickly', async () => {
  const startTime = Date.now();
  const { response } = await apiRequest('/health');
  const responseTime = Date.now() - startTime;

  expect(response.status).toBe(200);
  expect(responseTime).toBeLessThan(5000);

  console.log(`Health endpoint responded in ${responseTime}ms`);
});
