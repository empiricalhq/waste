import { test, expect } from 'bun:test';
import { http } from './http.ts';
import './setup.ts';

test('health endpoint returns ok', async () => {
  const response = await http.get('/health');

  expect(response.status).toBe(200);
  expect(response.data).toEqual({
    status: 'ok',
    timestamp: expect.any(Number),
  });
});
