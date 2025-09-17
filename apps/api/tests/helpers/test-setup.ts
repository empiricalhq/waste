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
  auth.clearSessions();

  const orgRes = await db.query<{ id: string }>(
    `INSERT INTO organization (id, name, slug) VALUES (gen_random_uuid(), 'Test Org', 'test-org') RETURNING id`,
  );
  const orgId = orgRes.rows[0]?.id;
  if (!orgId) {
    throw new Error('Failed to create organization during test setup.');
  }

  const adminConfig = testUsers.getUser('admin');
  await testUsers.ensureUserExists(adminConfig.email, adminConfig.password);

  return { client, auth, db };
}
