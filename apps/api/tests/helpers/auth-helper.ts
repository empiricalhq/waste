import type { TestClient } from './test-client.ts';
import type { TestUsers } from './test-users.ts';

interface Session {
  cookie: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  member: {
    id: string;
    role: string;
    organizationId: string;
  } | null;
}

export class AuthHelper {
  private readonly client: TestClient;
  private readonly sessions = new Map<string, Session>();
  private readonly testUsers: TestUsers;

  constructor(client: TestClient, testUsers: TestUsers) {
    this.client = client;
    this.testUsers = testUsers;
  }

  async loginAs(userType: 'admin' | 'driver' | 'citizen'): Promise<Session> {
    const user = this.testUsers.getUser(userType);
    return this.login(user.email, user.password);
  }

  async login(email: string, password: string): Promise<Session> {
    const existing = this.sessions.get(email);
    if (existing) {
      return existing;
    }

    await this.testUsers.ensureUser(email, password);

    const signInResponse = await this.client.post('/auth/sign-in/email', {
      email,
      password,
    });

    if (signInResponse.status !== 200) {
      throw new Error(`Login failed for ${email}: ${signInResponse.status}`);
    }

    const cookie = signInResponse.headers.get('set-cookie');
    if (!cookie) {
      throw new Error('No session cookie received');
    }

    // Set active organization in session for staff members
    const userConfig = this.testUsers.findUserByEmail(email);
    if (userConfig && userConfig.role !== 'citizen') {
      const orgRes = await this.client.get('/auth/organization/list', { Cookie: cookie });
      const org = orgRes.data?.[0];
      if (org) {
        await this.client.post('/auth/organization/active', { organizationId: org.id }, { Cookie: cookie });
      }
    }

    const sessionResponse = await this.client.get('/auth/get-session', { Cookie: cookie });
    if (sessionResponse.status !== 200) {
      throw new Error('Session verification failed');
    }

    const memberResponse = await this.client.get('/auth/organization/member/active', { Cookie: cookie });
    const member = memberResponse.status === 200 ? memberResponse.data : null;

    const session: Session = {
      cookie,
      user: sessionResponse.data.user,
      member: member,
    };

    this.sessions.set(email, session);
    return session;
  }

  getHeaders(userType: 'admin' | 'driver' | 'citizen'): Record<string, string> {
    const user = this.testUsers.getUser(userType);
    const session = this.sessions.get(user.email);
    if (!session) {
      throw new Error(`No session for ${userType}. Call loginAs('${userType}') first.`);
    }
    return { Cookie: session.cookie };
  }

  clear(): void {
    this.sessions.clear();
  }
}
