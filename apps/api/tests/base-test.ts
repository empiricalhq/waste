import { setDefaultTimeout } from 'bun:test';
import { TEST_CONFIG, TEST_USERS } from './config';
import { Auth } from './helpers/auth';
import { TestClient } from './helpers/client';
import { Database } from './helpers/database';

export interface TestContext {
  client: TestClient;
  auth: Auth;
  db: Database;
}

export class BaseTest {
  ctx!: TestContext;

  async setup(): Promise<TestContext> {
    setDefaultTimeout(TEST_CONFIG.defaultTimeout);

    const client = new TestClient();
    const db = new Database();
    const auth = new Auth(client, db);

    // clean state
    await db.clean();
    auth.clearSessions();

    // setup organization and admin user
    await this.setupOrganization(db);

    this.ctx = { client, auth, db };
    return this.ctx;
  }

  async teardown(): Promise<void> {
    if (this.ctx?.db) {
      await this.ctx.db.close();
    }
  }

  private async setupOrganization(db: Database): Promise<void> {
    // create organization
    const orgResult = await db.query<{ id: string }>(
      `INSERT INTO organization (id, name, slug) VALUES (gen_random_uuid(), 'Test Org', 'test-org') RETURNING id`,
    );
    const orgId = orgResult[0]?.id;
    if (!orgId) {
      throw new Error('Failed to create test organization');
    }

    // create admin user and membership
    const adminConfig = TEST_USERS.admin;
    const adminResult = await db.query<{ id: string }>(
      `INSERT INTO "user" (id, email, name) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
      [adminConfig.email, adminConfig.name],
    );
    const adminId = adminResult[0]?.id;
    if (!adminId) {
      throw new Error('Failed to create admin user');
    }

    await db.query(
      `INSERT INTO member (id, "userId", "organizationId", role) 
     VALUES (gen_random_uuid(), $1, $2, $3)`,
      [adminId, orgId, 'owner'],
    );

    // create driver user and membership
    const driverConfig = TEST_USERS.driver;
    const driverResult = await db.query<{ id: string }>(
      `INSERT INTO "user" (id, email, name) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
      [driverConfig.email, driverConfig.name],
    );
    const driverId = driverResult[0]?.id;
    if (!driverId) {
      throw new Error('Failed to create driver user');
    }

    await db.query(
      `INSERT INTO member (id, "userId", "organizationId", role)
     VALUES (gen_random_uuid(), $1, $2, $3)`,
      [driverId, orgId, 'driver'],
    );
  }
}
