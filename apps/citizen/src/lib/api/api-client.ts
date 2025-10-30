import { getApiConfig } from "./api-config";
import { handleApiError, AppError } from "@/lib/utils/error-handler";
import { APP_CONFIG } from "@/constants/app-config";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = APP_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  const { baseURL, timeout, headers } = await getApiConfig();
  const url = `${baseURL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Ocurrió un error inesperado.",
      }));
      throw new AppError(errorData.message, response.status, errorData.code);
    }

    // Handle responses with no content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (retries > 0 && !(error instanceof AppError)) {
      // Retry for network errors, not for server errors (4xx, 5xx)
      return request(endpoint, options, retries - 1);
    }

    throw handleApiError(error);
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T, D>(endpoint: string, data: D) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  patch: <T, D>(endpoint: string, data: D) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
