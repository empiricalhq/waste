import process from 'node:process';

import type { DbHelper } from './db-helper.ts';
import type { TestClient } from './test-client.ts';

interface UserConfig {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'driver' | 'citizen';
}

export class TestUsers {
  private readonly client: TestClient;
  private readonly db: DbHelper;
  private readonly users: Record<'admin' | 'driver' | 'citizen', UserConfig> = {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: 'admin123456',
      name: 'Test Admin',
      role: 'admin',
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

  getUser(type: 'admin' | 'driver' | 'citizen'): UserConfig {
    return this.users[type];
  }

  async ensureUser(email: string, password: string): Promise<void> {
    const userConfig = this.findUserByEmail(email);
    if (!userConfig) {
      throw new Error(`No user configuration for ${email}`);
    }

    const signUpResponse = await this.client.post('/auth/sign-up/email', {
      email,
      password,
      name: userConfig.name,
    });

    if (![200, 201, 422].includes(signUpResponse.status)) {
      throw new Error(`Signup failed: ${signUpResponse.status}`);
    }

    // Update role if not default citizen
    if (userConfig.role !== 'citizen') {
      await this.db.updateUserRole(email, userConfig.role);
    }
  }

  private findUserByEmail(email: string): UserConfig | null {
    return Object.values(this.users).find((u) => u.email === email) || null;
  }
}
