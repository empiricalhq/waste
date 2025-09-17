import { HTTP_STATUS } from '../config';
import type { TestClient } from './test-client';
import type { TestUsers } from './test-users';

// Define expected response shapes
type OrgListResponse = { id: string }[];
type GetSessionResponse = {
  user: { id: string; email: string; name: string };
};
type ActiveMemberResponse = {
  id: string;
  role: string;
  organizationId: string;
};

interface Session {
  cookie: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  member: ActiveMemberResponse | null;
}

export class AuthHelper {
  private readonly client: TestClient;
  private readonly users: TestUsers;
  private readonly sessions = new Map<string, Session>();

  constructor(client: TestClient, users: TestUsers) {
    this.client = client;
    this.users = users;
  }

  async loginAs(userType: 'admin' | 'driver' | 'citizen'): Promise<Session> {
    const user = this.users.getUser(userType);
    return this.login(user.email, user.password);
  }

  async login(email: string, password: string): Promise<Session> {
    const existing = this.sessions.get(email);
    if (existing) {
      return existing;
    }

    await this.users.ensureUserExists(email, password);

    const signInResponse = await this.client.post('/auth/sign-in/email', { email, password });
    if (signInResponse.status !== HTTP_STATUS.OK) {
      throw new Error(`Login failed for ${email}: Status ${signInResponse.status}`);
    }

    const cookieHeader = signInResponse.headers.get('set-cookie');
    if (!cookieHeader) {
      throw new Error('No session cookie received during login');
    }
    const mainCookie = cookieHeader.split(';')[0];
    if (!mainCookie) {
      throw new Error('Invalid session cookie format received');
    }
    let cookie = mainCookie;

    const userConfig = this.users.findUserByEmail(email);
    if (userConfig?.role !== 'citizen') {
      const orgRes = await this.client.get<OrgListResponse>('/auth/organization/list', { Cookie: cookie });
      const org = orgRes.data?.[0];

      if (org) {
        const setActiveRes = await this.client.post(
          '/auth/organization/set-active',
          { organizationId: org.id },
          { Cookie: cookie },
        );
        const newCookieHeader = setActiveRes.headers.get('set-cookie');
        if (newCookieHeader) {
          const newMainCookie = newCookieHeader.split(';')[0];
          if (newMainCookie) {
            cookie = newMainCookie;
          }
        }
      }
    }

    const sessionRes = await this.client.get<GetSessionResponse>('/auth/get-session', { Cookie: cookie });
    const memberRes = await this.client.get<ActiveMemberResponse>('/auth/organization/get-active-member', {
      Cookie: cookie,
    });

    const session: Session = {
      cookie,
      user: sessionRes.data.user,
      member: memberRes.status === HTTP_STATUS.OK ? memberRes.data : null,
    };

    this.sessions.set(email, session);
    return session;
  }

  getHeaders(userType: 'admin' | 'driver' | 'citizen'): { Cookie: string } {
    const user = this.users.getUser(userType);
    const session = this.sessions.get(user.email);
    if (!session) {
      throw new Error(`User '${userType}' is not logged in. Call loginAs() first.`);
    }
    return { Cookie: session.cookie };
  }

  clearSessions(): void {
    this.sessions.clear();
  }
}
