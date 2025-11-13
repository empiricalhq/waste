import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import type { LoginInput, SignUpInput } from "../types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = await storage.getToken();
      if (!token) {
        return null;
      }
      return api.getSession();
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => api.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (input: SignUpInput) => api.signUp(input),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
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
