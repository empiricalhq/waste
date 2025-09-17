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

  // 1. Create the admin user account via API.
  const adminConfig = users.getUser('admin');
  const adminId = await users.ensureUserExists(adminConfig.email, adminConfig.password);

  // 2. Create the organization directly in the database.
  const orgRes = await db.query<{ id: string }>(
    `INSERT INTO organization (id, name, slug) VALUES (gen_random_uuid(), 'Test Org', 'test-org') RETURNING id`,
  );
  const orgId = orgRes.rows[0]?.id;
  if (!orgId) {
    throw new Error('Failed to create organization during test setup.');
  }
  users.setOrgId(orgId);

  // 3. Create the admin's "owner" membership directly in the database.
  await db.addMember(adminId, orgId, 'owner');

  // 4. Create the driver user account via API.
  const driverConfig = users.getUser('driver');
  const driverId = await users.ensureUserExists(driverConfig.email, driverConfig.password);

  // 5. Create the driver's membership directly in the database, as the API endpoint is server-only.
  await db.addMember(driverId, orgId, driverConfig.role);

  // 6. Clear all sessions created during setup so tests start fresh.
  auth.clearSessions();

  return { client, auth, db, users };
}
