import process from 'node:process';
import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is required');
}

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  plugins: [usernameClient()],
  baseURL: baseUrl,
});
