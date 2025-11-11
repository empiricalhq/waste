import { APP_CONFIG } from "@/constants/app-config";
import {
  BetterAuthResponseSchema,
  UserSchema,
  validateApiResponse,
} from "@/lib/schemas/api-schemas";
import { deleteToken, saveToken } from "@/lib/storage/secure-storage";
import { AppError, handleApiError } from "@/lib/utils/error-handler";
import type { User } from "@/types";

async function makeAuthRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  sessionToken?: string,
): Promise<T> {
  const url = `${APP_CONFIG.API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (sessionToken) {
    headers.Cookie = `better-auth.session_token=${sessionToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Ocurrió un error inesperado.",
      }));
      throw new AppError(
        errorData.message || errorData.error,
        response.status,
        errorData.code,
      );
    }

    // handle responses with no content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

export const authService = {
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<User> => {
    const rawResponse = await makeAuthRequest<unknown>(
      "/api/auth/sign-in/email",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    const response = validateApiResponse(BetterAuthResponseSchema, rawResponse);

    // store the session token
    await saveToken(response.session.token);
    return response.user;
  },

  signUp: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> => {
    if (data.password.length < 8) {
      throw new AppError(
        "La contraseña debe tener al menos 8 caracteres.",
        400,
        "WEAK_PASSWORD",
      );
    }

    const rawResponse = await makeAuthRequest<unknown>(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    const response = validateApiResponse(BetterAuthResponseSchema, rawResponse);

    // store the session token
    await saveToken(response.session.token);
    return response.user;
  },

  logout: async (): Promise<void> => {
    // get token before deleting it
    const { getToken } = await import("@/lib/storage/secure-storage");
    const token = await getToken();

    // delete the token from storage
    await deleteToken();

    // call the logout endpoint to invalidate the session on the server
    if (token) {
      try {
        await makeAuthRequest("/api/auth/sign-out", { method: "POST" }, token);
      } catch {
        // ignore errors during logout, token is already cleared locally
      }
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const token = await import("@/lib/storage/secure-storage").then((m) =>
      m.getToken(),
    );
    if (!token) {
      throw new AppError("No authentication token found", 401);
    }

    const rawResponse = await makeAuthRequest<unknown>(
      "/api/auth/get-session",
      {},
      token,
    );

    // validate response, we just need the user object
    const validated = validateApiResponse(
      UserSchema,
      (rawResponse as any).user,
    );
    return validated;
  },
};
