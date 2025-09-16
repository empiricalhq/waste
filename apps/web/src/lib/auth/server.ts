import type { User } from '@lima-garbage/database';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:4000';

interface SessionResponse {
  user: User;
  session: {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
  };
}

export async function getSession(): Promise<SessionResponse | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token');

  if (!sessionToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: {
        Cookie: `better-auth.session_token=${sessionToken.value}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

export const auth = {
  api: {
    getSession,
  },
};
