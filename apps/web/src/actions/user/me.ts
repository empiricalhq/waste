'use server';

import type { User } from '@lima-garbage/database';
import { auth } from '@/lib/auth/server';

export async function getMe(): Promise<User | null> {
  const session = await auth.api.getSession();
  if (!session) {
    return null;
  }

  const user = session.user;

  // Maintain the same role check logic as before
  if (user.appRole !== 'admin' && user.appRole !== 'supervisor') {
    return null;
  }

  return user;
}
