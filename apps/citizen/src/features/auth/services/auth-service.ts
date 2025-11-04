import { apiClient } from '@/lib/api/api-client';
import { deleteToken, saveToken } from '@/lib/storage/secure-storage';
import type { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const { token, user } = await apiClient.post<AuthResponse, typeof credentials>('/auth/login', credentials);
    await saveToken(token);
    return user;
  },

  signUp: async (data: { name: string; email: string; password: string }): Promise<User> => {
    const { token, user } = await apiClient.post<AuthResponse, typeof data>('/auth/signup', data);
    await saveToken(token);
    return user;
  },

  logout: async (): Promise<void> => {
    await deleteToken();
    // Optional: Call a '/auth/logout' endpoint to invalidate the token on the server
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/users/me');
  },
};
