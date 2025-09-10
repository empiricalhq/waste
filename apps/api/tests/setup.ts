import { beforeAll, afterAll } from 'bun:test';
import { BASE_URL } from './config';
import { setupTestDatabase, teardownTestDatabase } from './database';
import app from '../src/app.ts';

let server: any = null;

beforeAll(async () => {
  console.log('@lima-garbage/api/test is starting up...');
  
  // Setup test database first
  await setupTestDatabase();

  // Start the API server for testing
  const port = 4000;
  server = Bun.serve({
    port,
    fetch: app.fetch,
  });
  
  console.log(`Test server started at http://localhost:${port}`);
  console.log(`Base URL: ${BASE_URL}`);

  // Give the server a moment to fully start
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  console.log('@lima-garbage/api/test is shutting down...');
  
  // Stop the server
  if (server) {
    server.stop();
    console.log('Test server stopped');
  }
  
  // Clean up test database
  await teardownTestDatabase();
});
