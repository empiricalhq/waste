import { createAuthClient } from 'better-auth/react';

// Point to the web app's own API route which proxies to the API service
export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  baseURL: '/api/auth',
});
