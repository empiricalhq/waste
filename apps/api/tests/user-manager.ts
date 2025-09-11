import { http } from './http.ts';
import { db } from './db.ts';
import { TEST_USERS } from './config.ts';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'driver' | 'citizen';
}

export class UserManager {
  private getUserConfig(email: string): TestUser | null {
    for (const user of Object.values(TEST_USERS)) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(email: string, password: string): Promise<void> {
    const userConfig = this.getUserConfig(email);
    if (!userConfig) {
      throw new Error(`No test user configuration found for ${email}`);
    }

    // sign up the user, the api applies the default citizen appRole
    const signUpResponse = await http.post('/auth/sign-up/email', {
      email,
      password,
      name: userConfig.name,
    });

    if (![200, 201, 422].includes(signUpResponse.status)) {
      throw new Error(`Signup failed for ${email}: ${signUpResponse.status} - ${JSON.stringify(signUpResponse.data)}`);
    }

    // if this user should be an admin user, we upgrade them directly in DB
    // this is the only justified use of direct DB access
    if (userConfig.role === 'admin') {
      await db.updateUserAppRole(email, 'admin');
    }
  }

  getUserRole(email: string): string {
    const userConfig = this.getUserConfig(email);
    return userConfig?.role || 'citizen';
  }
}

export const userManager = new UserManager();
