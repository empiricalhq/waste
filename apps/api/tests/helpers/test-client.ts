import { TEST_CONFIG } from '../config.ts';

interface Response<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export class TestClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = TEST_CONFIG.baseUrl;
  }

  async request<T = any>(
    method: string,
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<Response<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: T;
    const text = await response.text();

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text as T;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<Response<T>> {
    return this.request<T>('GET', endpoint, undefined, headers);
  }

  async post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<Response<T>> {
    return this.request<T>('POST', endpoint, body, headers);
  }

  async put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<Response<T>> {
    return this.request<T>('PUT', endpoint, body, headers);
  }

  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<Response<T>> {
    return this.request<T>('DELETE', endpoint, undefined, headers);
  }
}
