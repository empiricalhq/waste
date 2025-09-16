import { createAuthClient } from 'better-auth/react';

// Point to the web app's own API route which proxies to the API service
const getBaseURL = () => {
  // we do this or else build fails, TODO
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  return window.location.origin;
};

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  baseURL: getBaseURL(),
});
