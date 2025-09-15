import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  plugins: [usernameClient()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
});
