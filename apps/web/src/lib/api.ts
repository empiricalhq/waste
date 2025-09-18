import 'server-only';
import { cookies } from 'next/headers';
import type { Issue, Route, Truck, User } from './api-contract';
import { ENV } from './env';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${ENV.API_BASE_URL}${endpoint}`;
  const sessionToken = (await cookies()).get('better-auth.session_token')?.value;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (sessionToken) {
    headers.set('Cookie', `better-auth.session_token=${sessionToken}`);
  }

  const config: RequestInit = { ...options, headers, cache: 'no-store' };

  try {
    const response = await fetch(url, config);

    const setCookieHeader = response.headers.get('Set-Cookie');
    if (setCookieHeader) {
      const tokenValue = setCookieHeader.split(';')[0].split('=')[1];
      (await cookies()).set('better-auth.session_token', tokenValue, {
        httpOnly: true,
        path: '/',
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new ApiError(errorData.error || `API Error: ${response.status}`, response.status);
    }

    if (response.status === 204) {
      return null as T;
    }

    const jsonResponse = await response.json();
    return jsonResponse.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'API connection failed', 503);
  }
}

const admin = {
  getDrivers: () => request<User[]>('/api/admin/drivers'),
  getTrucks: () => request<Truck[]>('/api/admin/trucks'),
  getRoutes: () => request<Route[]>('/api/admin/routes'),
  getOpenIssues: () => request<Issue[]>('/api/admin/issues'),
};

export const api = {
  admin,
};
