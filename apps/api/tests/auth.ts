import { http } from './http.ts';
import { TEST_USERS } from './config.ts';

interface AuthSession {
  cookie: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class AuthHelper {
  private sessions = new Map<string, AuthSession>();

  private getRoleFromEmail(email: string): string {
    for (const [, user] of Object.entries(TEST_USERS)) {
      if (user.email === email) {
        return user.role;
      }
    }
    return 'citizen'; // default
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const existing = this.sessions.get(email);
    if (existing) {
      return existing;
    }

    const role = this.getRoleFromEmail(email);

    // sign up first (idempotent)
    const signUpResponse = await http.post('/auth/sign-up/email', {
      email,
      password,
      name: email.split('@')[0],
    });

    // Update user role in database if user was just created or already exists
    if (signUpResponse.status === 200 || signUpResponse.status === 422) {
      try {
        // Use a direct database connection to update the role
        const { Pool } = await import('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        await pool.query('UPDATE "user" SET "role" = $1 WHERE email = $2', [role, email]);
        await pool.end();
      } catch (error) {
        console.error(`Failed to update role for ${email}:`, error);
      }
    }

    const response = await http.post('/auth/sign-in/email', {
      email,
      password,
    });

    if (response.status !== 200) {
      console.error(`Login failed for ${email}:`, {
        status: response.status,
        statusText: response.statusText,
        body: response.data,
      });
      throw new Error(`Login failed for ${email}: ${response.status} - ${JSON.stringify(response.data)}`);
    }

    const cookie = response.headers.get('set-cookie');
    if (!cookie) {
      throw new Error(`No session cookie received for ${email}`);
    }

    // verify session
    const sessionResponse = await http.get('/auth/get-session', { Cookie: cookie });
    if (sessionResponse.status !== 200) {
      throw new Error(`Session verification failed for ${email}`);
    }

    const session: AuthSession = {
      cookie,
      user: sessionResponse.data.user,
    };

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
