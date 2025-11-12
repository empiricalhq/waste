import { API_URL, CONFIG, ERROR_MESSAGES } from '@/constants';
import type { ApiError } from '@/types';
import { storage } from './storage';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_URL, timeout: number = CONFIG.api.timeout) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = await storage.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Cookie = `better-auth.session_token=${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (response.status === 204) {
        return null as T;
      }

      const json = await response.json();
      return (json.data !== undefined ? json.data : json) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }

    const error: ApiError = {
      message: errorData.error || errorData.message || ERROR_MESSAGES.GENERIC,
      status: response.status,
      code: errorData.code,
    };

    throw error;
  }

  private handleError(error: unknown): ApiError {
    if (this.isApiError(error)) {
      return error;
    }

    if ((error as Error).name === 'AbortError') {
      return {
        message: ERROR_MESSAGES.TIMEOUT,
        status: 408,
        code: 'TIMEOUT',
      };
    }

    return {
      message: ERROR_MESSAGES.NETWORK,
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'status' in error
    );
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth-specific method with cookie handling
  async authRequest<T>(endpoint: string, data: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Extract and store session token
      const cookieHeader = response.headers.get('set-cookie');
      const sessionToken = this.extractSessionToken(cookieHeader);
      
      if (sessionToken) {
        await storage.setToken(sessionToken);
      }

      const json = await response.json();
      const result = json.data !== undefined ? json.data : json;

      return result.user || result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  private extractSessionToken(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(/[,;]/).map(c => c.trim());
    for (const cookie of cookies) {
      const match = cookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) return match[1];
    }
    return null;
  }
}

export const apiClient = new ApiClient();
