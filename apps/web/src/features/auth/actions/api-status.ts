'use server';

import { api } from '@/lib/api';

export async function checkApiStatus(): Promise<boolean> {
  try {
    await api.auth.getSession();
    return true;
  } catch {
    return false;
  }
}
