import { expect, test } from 'bun:test';
import { TEST_CONFIG } from './config.ts';

test('health endpoint returns ok', async () => {
  const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toEqual({
    status: 'ok',
    timestamp: expect.any(Number),
  });
});
