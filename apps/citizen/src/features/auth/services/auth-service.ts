import { APP_CONFIG } from '@/constants/app-config';
import { deleteToken, saveToken } from '@/lib/storage/secure-storage';
import { AppError, handleApiError } from '@/lib/utils/error-handler';
import type { User } from '@/types';

interface BetterAuthResponse {
  user: User;
  session: {
    id: string;
    token: string;
    expiresAt: string;
  };
}

interface BetterAuthSessionResponse {
  user: User;
  session: {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
  };
}

async function makeAuthRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  sessionToken?: string,
): Promise<T> {
  const url = `${APP_CONFIG.API_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
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
        message: 'Ocurrió un error inesperado.',
      }));
      throw new AppError(errorData.message || errorData.error, response.status, errorData.code);
    }

    // Handle responses with no content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await makeAuthRequest<BetterAuthResponse>('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store the session token
    await saveToken(response.session.token);
    return response.user;
  },

  signUp: async (data: { name: string; email: string; password: string }): Promise<User> => {
    const response = await makeAuthRequest<BetterAuthResponse>('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store the session token
    await saveToken(response.session.token);
    return response.user;
  },

  logout: async (): Promise<void> => {
    // Get token before deleting it
    const { getToken } = await import('@/lib/storage/secure-storage');
    const token = await getToken();
    
    // Delete the token from storage
    await deleteToken();
    
    // Call the logout endpoint to invalidate the session on the server
    if (token) {
      try {
        await makeAuthRequest('/api/auth/sign-out', { method: 'POST' }, token);
      } catch {
        // Ignore errors during logout - token is already cleared locally
      }
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const token = await import('@/lib/storage/secure-storage').then((m) => m.getToken());
    if (!token) {
      throw new AppError('No authentication token found', 401);
    }

    const response = await makeAuthRequest<BetterAuthSessionResponse>('/api/auth/get-session', {}, token);
    return response.user;
  },
};
