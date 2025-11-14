import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoginInput, SignUpInput } from "@/types";

/**
 * Main auth hook. Uses local storage as source of truth on mount,
 * then validates with API in background.
 */
export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const storedUser = await api.getStoredUser();
      if (!storedUser) {
        return null;
      }

      // If we have a stored user, we MUST validate the session with the server.
      // Failing to do so is a major security risk.
      try {
        const validatedUser = await api.validateSession();
        // If the session is invalid, validatedUser will be null.
        return validatedUser;
      } catch (error) {
        // If validation fails (e.g., network error, server error, revoked token),
        // we must treat the user as logged out for security.
        console.warn("Session validation failed. Forcing logout.", error);
        return null;
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
