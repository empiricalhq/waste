import { expect, test } from 'bun:test';
import { HTTP_STATUS, TEST_CONFIG } from './config';

test('health endpoint returns ok', async () => {
  const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/health`);
  const data = await response.json();

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(data).toEqual({
    status: 'ok',
    timestamp: expect.any(Number),
  });
});
