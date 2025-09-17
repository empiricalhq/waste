import 'server-only';

import { cookies } from 'next/headers';
import { ENV } from './env.ts';

class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${ENV.API_BASE_URL}${endpoint}`;
  const sessionToken = (await cookies()).get('better-auth.session_token')?.value;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
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
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(errorData.message || `API Error: ${response.status}`, response.status);
    }

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      return (await response.json()) as T;
    }

    return response.text() as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'API connection failed',
      HTTP_STATUS_SERVICE_UNAVAILABLE,
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : null }),
  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : null }),
  delete: <T>(endpoint: string, options?: Omit<RequestInit, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
