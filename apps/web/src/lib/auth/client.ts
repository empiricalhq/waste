import { createAuthClient } from 'better-auth/react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  baseURL: `${apiBaseUrl}/api/auth`,
});
