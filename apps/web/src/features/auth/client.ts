'use client';

import { createAuthClient } from 'better-auth/react';

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  return window.location.origin;
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});
