import 'server-only';
import { cookies } from 'next/headers';
import type { AuthContext } from '@/features/auth/lib';
import type { CreateIssueSchema } from '@/features/issues/schemas';
import type { CreateRouteSchema } from '@/features/routes/schemas';
import type { Issue, Route, Truck, User } from './api-contract';
import { ENV } from './env';

const HTTP_NO_CONTENT = 204;
const HTTP_SERVICE_UNAVAILABLE = 503;
const ERROR_MESSAGES: Record<number, string> = {
  422: 'El usuario ya ha sido registrado',
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  apiOptions: { ignoreSetCookie?: boolean } = {},
): Promise<T> {
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

    if (!apiOptions.ignoreSetCookie) {
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
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      const message = ERROR_MESSAGES[response.status] || errorData.error || `API Error: ${response.status}`;
      throw new ApiError(message, response.status);
    }

    if (response.status === HTTP_NO_CONTENT) {
      return null as T;
    }

    const jsonResponse = await response.json();
    return 'data' in jsonResponse ? (jsonResponse.data as T) : (jsonResponse as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'API connection failed', HTTP_SERVICE_UNAVAILABLE);
  }
}

function post<T>(endpoint: string, body?: unknown, apiOptions?: { ignoreSetCookie?: boolean }): Promise<T> {
  return request<T>(
    endpoint,
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    },
    apiOptions,
  );
}

const admin = {
  getDrivers: () => request<User[]>('/api/admin/drivers', {}, { ignoreSetCookie: true }),
  createDriver: (data: { name: string; email: string; password: string }) =>
    post<User>('/api/admin/drivers', data, { ignoreSetCookie: true }),
  updateDriver: (id: string, data: { name: string; email: string; password?: string }) =>
    post<User>(`/api/admin/drivers/${id}`, data, { ignoreSetCookie: true }),

  getSupervisors: () => request<User[]>('/api/admin/supervisors', {}, { ignoreSetCookie: true }),
  createSupervisor: (data: { name: string; email: string; password: string }) =>
    post<User>('/api/admin/supervisors', data, { ignoreSetCookie: true }),
  updateSupervisor: (id: string, data: { name: string; email: string; password?: string }) =>
    post<User>(`/api/admin/supervisors/${id}`, data, { ignoreSetCookie: true }),

  getTrucks: () => request<Truck[]>('/api/admin/trucks', {}, { ignoreSetCookie: true }),
  getRoutes: () => request<Route[]>('/api/admin/routes', {}, { ignoreSetCookie: true }),
  getOpenIssues: () => request<Issue[]>('/api/admin/issues', {}, { ignoreSetCookie: true }),
  createRoute: (data: CreateRouteSchema) => post<Route>('/api/admin/routes', data, { ignoreSetCookie: true }),
  deleteRoute: (id: string) =>
    request<void>(`/api/admin/routes/${id}`, { method: 'DELETE' }, { ignoreSetCookie: true }),
  createIssue: (data: CreateIssueSchema) => post<Issue>('/api/admin/issues', data, { ignoreSetCookie: true }),
};

const auth = {
  getSession: () => request<AuthContext | null>('/api/auth/get-session'),
};

export const api = {
  admin,
  auth,
  post,
};
