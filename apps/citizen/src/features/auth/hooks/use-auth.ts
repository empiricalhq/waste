import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoginInput, SignUpInput } from "@/types";

/**
 * Main auth hook. Uses local storage as source of truth on mount,
 * then validates with API in background.
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Load user from storage immediately (fast, offline-friendly)
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // First, try to get stored user
      const storedUser = await api.getStoredUser();
      if (!storedUser) {
        return null;
      }

      // If we have a stored user, validate the session in background
      try {
        const validatedUser = await api.validateSession();
        return validatedUser || null;
      } catch (error) {
        // If validation fails, return stored user anyway (offline support)
        // The next API call will handle auth errors
        console.warn("Session validation failed, using cached user", error);
        return storedUser;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => api.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
    onError: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (input: SignUpInput) => api.signUp(input),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
    onError: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      // Clear all cached data on logout
      queryClient.clear();
    },
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: Boolean(user),
    login: loginMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isAuthLoading:
      loginMutation.isPending ||
      signUpMutation.isPending ||
      logoutMutation.isPending,
  };
}
