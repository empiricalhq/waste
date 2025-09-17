import { TEST_CONFIG } from '../config';

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export class TestClient {
  private readonly baseUrl = TEST_CONFIG.apiBaseUrl;

  private async request<T = unknown>(
    method: string,
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    return { data, status: response.status, headers: response.headers };
  }

  async get<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, headers);
  }

  async post<T = unknown>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, headers);
  }

  async put<T = unknown>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, headers);
  }

  async delete<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, headers);
  }
}
