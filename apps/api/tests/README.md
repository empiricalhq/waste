# API Tests

1. Setup test database schema (only neccesary the first time):

   ```bash
   cd packages/database
   bun run db:push:test
   ```

2. Start the test server:

   ```bash
   cd apps/api
   bun run test:server
   ```

   This starts the API server using the test database from `.env.test`

3. Run tests (in another terminal):
   ```bash
   cd apps/api
   bun run test
   ```
