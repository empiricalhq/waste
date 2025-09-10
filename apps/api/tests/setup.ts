import { beforeAll, afterAll } from 'bun:test';
import { BASE_URL } from './config';
import { setupTestDatabase, teardownTestDatabase } from './database';

beforeAll(async () => {
  console.log('@lima-garbage/api/test: Starting up...');
  console.log(`@lima-garbage/api/test: Base URL: ${BASE_URL}`);
  console.log('Make sure to run: bun run test:server');

  await setupTestDatabase();
});

afterAll(async () => {
  console.log('@lima-garbage/api/test is shutting down...');

  await teardownTestDatabase();
});
