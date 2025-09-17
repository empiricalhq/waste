import process from 'node:process';

import type { DbHelper } from './db-helper.ts';
import type { TestClient } from './test-client.ts';

interface UserConfig {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'driver' | 'citizen';
}

export class TestUsers {
  private readonly client: TestClient;
  private readonly db: DbHelper;
  private orgId: string | null = null;
  private readonly users: Record<'admin' | 'driver' | 'citizen', UserConfig> = {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: 'admin123456',
      name: 'Test Admin',
      role: 'owner',
    },
    driver: {
      email: 'driver@test.com',
      password: 'driver123456',
      name: 'Test Driver',
      role: 'driver',
    },
    citizen: {
      email: 'citizen@test.com',
      password: 'citizen123456',
      name: 'Test Citizen',
      role: 'citizen',
    },
  };

  constructor(client: TestClient, db: DbHelper) {
    this.client = client;
    this.db = db;
  }

  setOrgId(id: string) {
    this.orgId = id;
  }

  getUser(type: 'admin' | 'driver' | 'citizen'): UserConfig {
    return this.users[type];
  }

  async ensureUser(email: string, password: string): Promise<string> {
    const userConfig = this.findUserByEmail(email);
    if (!userConfig) {
      throw new Error(`No user configuration for ${email}`);
    }

    const existingUserRes = await this.db.query('SELECT id FROM "user" WHERE email = $1', [email]);
    if (existingUserRes.rows.length > 0) {
      return existingUserRes.rows[0].id;
    }

    const signUpResponse = await this.client.post('/auth/sign-up/email', {
      email,
      password,
      name: userConfig.name,
    });

    if (![200, 201, 422].includes(signUpResponse.status)) {
      const error = signUpResponse.data?.error || 'Signup failed';
      if (signUpResponse.status !== 422) {
        throw new Error(`Signup failed: ${signUpResponse.status} - ${error}`);
      }
    }

    const userRes = await this.db.query('SELECT id FROM "user" WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      throw new Error(`Failed to create or find user ${email} after sign-up.`);
    }
    const userId = userRes.rows[0].id;

    if (userConfig.role !== 'citizen') {
      if (!this.orgId) {
        throw new Error('Organization ID not set in TestUsers helper. Cannot create staff members.');
      }
      await this.db.addMember(userId, this.orgId, userConfig.role);
    }

    return userId;
  }

  findUserByEmail(email: string): UserConfig | null {
    return Object.values(this.users).find((u) => u.email === email) || null;
  }
}
