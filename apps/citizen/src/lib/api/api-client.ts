import { router } from "expo-router";
import { APP_CONFIG, ROUTES } from "@/constants/app-config";
import { deleteToken } from "@/lib/storage/secure-storage";
import { AppError, handleApiError } from "@/lib/utils/error-handler";
import { getApiConfig } from "./api-config";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = APP_CONFIG.RETRY_ATTEMPTS,
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

      // handle 401 (unauthorized): clear token and redirect to login
      if (response.status === 401) {
        await deleteToken();
        // use setTimeout to avoid navigation during render
        setTimeout(() => {
          router.replace(ROUTES.LOGIN);
        }, 0);
      }

      throw new AppError(errorData.message, response.status, errorData.code);
    }

    // handle responses with no content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // don't retry on 401 errors or other client errors
    const isClientError =
      error instanceof AppError &&
      error.statusCode >= 400 &&
      error.statusCode < 500;

    if (retries > 0 && !isClientError) {
      // retry for network errors, not for client errors (4xx)
      return request(endpoint, options, retries - 1);
    }

    throw handleApiError(error);
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T, D = unknown>(endpoint: string, data: D) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  patch: <T, D = unknown>(endpoint: string, data: D) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
