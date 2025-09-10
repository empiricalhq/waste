import { beforeAll } from 'bun:test';
import { BASE_URL } from './config';

beforeAll(async () => {
  console.log('@lima-garbage/api/test is starting up...');
  console.log(`Base URL: ${BASE_URL}`);

  await new Promise(resolve => setTimeout(resolve, 1000));
});
