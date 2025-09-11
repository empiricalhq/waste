import { http } from './http.ts';
import { userManager } from './user-manager.ts';

interface AuthSession {
  cookie: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    appRole: string;
  };
}

export class AuthHelper {
  private sessions = new Map<string, AuthSession>();

  async login(email: string, password: string): Promise<AuthSession> {
    const existing = this.sessions.get(email);
    if (existing) {
      return existing;
    }

    await userManager.createUser(email, password);

    const response = await http.post('/auth/sign-in/email', {
      email,
      password,
    });

    if (response.status !== 200) {
      throw new Error(`Login failed for ${email}: ${response.status} - ${JSON.stringify(response.data)}`);
    }

    const cookie = response.headers.get('set-cookie');
    if (!cookie) {
      throw new Error(`No session cookie received for ${email}`);
    }

    const sessionResponse = await http.get('/auth/get-session', { Cookie: cookie });
    if (sessionResponse.status !== 200) {
      throw new Error(`Session verification failed for ${email}`);
    }

    const session: AuthSession = {
      cookie,
      user: sessionResponse.data.user,
    };

    const expectedAppRole = userManager.getUserRole(email);
    if (session.user.appRole !== expectedAppRole && expectedAppRole !== 'admin') {
      throw new Error(
        `AppRole mismatch for ${email}: expected ${expectedAppRole}, got ${session.user.appRole}. ` +
          `Check your API's user creation logic for non-admin users.`,
      );
    }

    this.sessions.set(email, session);
    return session;
  }

  async getSession(email: string): Promise<AuthSession> {
    const session = this.sessions.get(email);
    if (!session) {
      throw new Error(`No session found for ${email}. Call login() first.`);
    }
    return session;
  }

  getAuthHeaders(email: string): Record<string, string> {
    const session = this.sessions.get(email);
    if (!session) {
      throw new Error(`No session found for ${email}`);
    }
    return { Cookie: session.cookie };
  }

  clear(): void {
    this.sessions.clear();
  }
}

export const auth = new AuthHelper();
