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

  // Bootstrap the organization and owner (admin)
  const adminConfig = testUsers.getUser('admin');

  // Create admin user
  await testUsers.ensureUser(adminConfig.email, adminConfig.password);
  const adminDbUser = await db.query('SELECT id FROM "user" WHERE email = $1', [adminConfig.email]);
  const adminId = adminDbUser.rows[0].id;

  // Create organization and make admin the owner
  const orgRes = await db.query(
    `INSERT INTO organization (id, name, slug) VALUES (gen_random_uuid(), 'Test Org', 'test-org') RETURNING id`,
  );
  const orgId = orgRes.rows[0].id;

  // Manually add the first user as an owner, bypassing the ensureUser logic for the first time
  await db.addMember(adminId, orgId, 'owner');

  // Pass orgId to testUsers helper for subsequent user creations
  testUsers.setOrgId(orgId);

  return { client, auth, db };
}
