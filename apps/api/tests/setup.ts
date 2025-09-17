import { AuthHelper } from './helpers/auth-helper';
import { DbHelper } from './helpers/db-helper';
import { TestClient } from './helpers/test-client';
import { TestUsers } from './helpers/test-users';

export interface TestContext {
  client: TestClient;
  auth: AuthHelper;
  db: DbHelper;
  users: TestUsers;
}

export async function setupTest(): Promise<TestContext> {
  const client = new TestClient();
  const db = new DbHelper();
  const users = new TestUsers(client, db);
  const auth = new AuthHelper(client, users);

  // Clean database before each test
  await db.clean();
  auth.clearSessions();

  // Create a default organization for staff members
  const orgRes = await db.query<{ id: string }>(
    `INSERT INTO organization (id, name, slug) VALUES (gen_random_uuid(), 'Test Org', 'test-org') RETURNING id`,
  );
  const orgId = orgRes.rows[0]?.id;
  if (!orgId) {
    throw new Error('Failed to create organization during test setup.');
  }
  users.setOrgId(orgId);

  // Ensure all staff users exist before tests run
  const adminConfig = users.getUser('admin');
  await users.ensureUserExists(adminConfig.email, adminConfig.password);

  const driverConfig = users.getUser('driver');
  await users.ensureUserExists(driverConfig.email, driverConfig.password);

  return { client, auth, db, users };
}
