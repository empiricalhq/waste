'use server';

import type { User } from '@lima-garbage/database';
import { auth } from '@/lib/auth/server';

export async function getMe(): Promise<User | null | undefined> {
  const session = await auth.api.getSession();
  if (!session) {
    return null;
  }

  try {
    const response = await fetch('http://localhost:4000/api/admin/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `better-auth.session_token=${session.session.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      if (response.status === 403) {
        return null;
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const user = await response.json() as User;
    
    if (user.appRole !== 'admin' && user.appRole !== 'supervisor') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}
