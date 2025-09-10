import { test, expect } from 'bun:test';
import { apiRequest } from './helpers';

test('health endpoint returns success', async () => {
  const { response, data } = await apiRequest('/health');

  console.log('Health response data:', data);

  expect(response.status).toBe(200);
  expect(data).toBeDefined();
});
