import { AuthHelper } from './auth-helper.ts';
import { DbHelper } from './db-helper.ts';
import { TestClient } from './test-client.ts';
import { TestUsers } from './test-users.ts';

export interface TestContext {
  client: TestClient;
  auth: AuthHelper;
  db: DbHelper;
}

export async function setupTest(): Promise<TestContext> {
  const client = new TestClient();
  const db = new DbHelper();
  const testUsers = new TestUsers(client, db);
  const auth = new AuthHelper(client, testUsers);

  await db.clean();
  auth.clear();

  return { client, auth, db };
}
