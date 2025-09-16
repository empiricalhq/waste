import { cookies } from 'next/headers';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.API_BASE_URL || 'http://localhost:4000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // TODO: delete this whole thing, i think i added it because of edge runtime issues
    if (typeof window !== 'undefined') {
      // client-side: cookies are handled automatically
      return {};
    }

    // server-side: manually add cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better-auth.session_token');

    return sessionToken ? { Cookie: `${sessionToken.name}=${sessionToken.value}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
        );
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return response.text() as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 0);
    }
  }

  // HTTP methods
  get<T>(endpoint: string, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export const api = {
  // auth endpoints
  auth: {
    signIn: (credentials: { email: string; password: string }) => apiClient.post('/api/auth/signin', credentials),
    signUp: (data: any) => apiClient.post('/api/auth/signup', data),
    signOut: () => apiClient.post('/api/auth/signout'),
    getSession: () => apiClient.get('/api/auth/get-session'),
  },

  // admin endpoints
  admin: {
    drivers: {
      list: () => apiClient.get('/api/admin/drivers'),
      get: (id: string) => apiClient.get(`/api/admin/drivers/${id}`),
      create: (data: any) => apiClient.post('/api/admin/drivers', data),
      update: (id: string, data: any) => apiClient.put(`/api/admin/drivers/${id}`, data),
      delete: (id: string) => apiClient.delete(`/api/admin/drivers/${id}`),
    },
    vehicles: {
      list: () => apiClient.get('/api/admin/trucks'),
      get: (id: string) => apiClient.get(`/api/admin/trucks/${id}`),
      create: (data: any) => apiClient.post('/api/admin/trucks', data),
      update: (id: string, data: any) => apiClient.put(`/api/admin/trucks/${id}`, data),
      delete: (id: string) => apiClient.delete(`/api/admin/trucks/${id}`),
    },
    routes: {
      list: () => apiClient.get('/api/admin/routes'),
      get: (id: string) => apiClient.get(`/api/admin/routes/${id}`),
      create: (data: any) => apiClient.post('/api/admin/routes', data),
      update: (id: string, data: any) => apiClient.put(`/api/admin/routes/${id}`, data),
      delete: (id: string) => apiClient.delete(`/api/admin/routes/${id}`),
    },
    alerts: {
      list: () => apiClient.get('/api/admin/alerts'),
      markAsRead: (id: string) => apiClient.put(`/api/admin/alerts/${id}/read`),
    },
    issues: {
      list: () => apiClient.get('/api/admin/issues'),
      get: (id: string) => apiClient.get(`/api/admin/issues/${id}`),
      update: (id: string, data: any) => apiClient.put(`/api/admin/issues/${id}`, data),
    },
  },
} as const;
