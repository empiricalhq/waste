import { apiClient } from "@/lib/api/api-client";
import { saveToken, deleteToken } from "@/lib/storage/secure-storage";
import { User } from "@/types";

type AuthResponse = {
  token: string;
  user: User;
};

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const { token, user } = await apiClient.post<AuthResponse>("/auth/login", credentials);
    await saveToken(token);
    return user;
  },

  signUp: async (data: { name: string; email: string; password: string }): Promise<User> => {
    const { token, user } = await apiClient.post<AuthResponse>("/auth/signup", data);
    await saveToken(token);
    return user;
  },

  logout: async (): Promise<void> => {
    await deleteToken();
    // Optional: Call a '/auth/logout' endpoint to invalidate the token on the server
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>("/users/me");
  },
};
