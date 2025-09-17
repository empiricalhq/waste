import process from 'node:process';
import { HTTP_STATUS } from '../config';
import type { DbHelper } from './db-helper';
import type { TestClient } from './test-client';

interface UserConfig {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'driver' | 'citizen';
}

export class TestUsers {
  private readonly client: TestClient;
  private readonly db: DbHelper;
  private readonly users: Record<'admin' | 'driver' | 'citizen', UserConfig> = {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: 'admin-password-123',
      name: 'Test Admin',
      role: 'owner',
    },
    driver: {
      email: 'driver@test.com',
      password: 'driver-password-123',
      name: 'Test Driver',
      role: 'driver',
    },
    citizen: {
      email: 'citizen@test.com',
      password: 'citizen-password-123',
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

  findUserByEmail(email: string): UserConfig | null {
    return Object.values(this.users).find((u) => u.email === email) || null;
  }

  async ensureUserExists(email: string, password: string): Promise<string> {
    const existingUser = await this.db.query<{ id: string }>('SELECT id FROM "user" WHERE email = $1', [email]);
    if (existingUser.rows[0]) {
      return existingUser.rows[0].id;
    }

    const userConfig = this.findUserByEmail(email);
    if (!userConfig) {
      throw new Error(`No test user configuration found for email: ${email}`);
    }

    const signUpResponse = await this.client.post('/auth/sign-up/email', {
      email,
      password,
      name: userConfig.name,
    });
    if (!([HTTP_STATUS.OK, HTTP_STATUS.CREATED] as number[]).includes(signUpResponse.status)) {
      throw new Error(`Sign-up failed for ${email}: Status ${signUpResponse.status}`);
    }

    const newUser = await this.db.query<{ id: string }>('SELECT id FROM "user" WHERE email = $1', [email]);
    const userId = newUser.rows[0]?.id;
    if (!userId) {
      throw new Error(`Failed to retrieve new user ID for ${email}`);
    }

    return userId;
  }
}
