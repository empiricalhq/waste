import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSegments } from "expo-router";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { api } from "./api";
import { storage } from "./storage";
import type { User, LoginInput, SignUpInput } from "./schemas";

interface AuthContext {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  signUp: (data: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const segments = useSegments();

  // check if we have a token on mount
  useEffect(() => {
    storage.getToken().then((token) => {
      setIsReady(true);
      if (!token) {
        queryClient.setQueryData([QUERY_KEYS.USER], null);
      }
    });
  }, [queryClient]);

  const { data: user, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: api.getCurrentUser,
    enabled: isReady,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (user) => {
      queryClient.setQueryData([QUERY_KEYS.USER], user);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: api.signUp,
    onSuccess: (user) => {
      queryClient.setQueryData([QUERY_KEYS.USER], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    },
  });

  // navigation guard
  useEffect(() => {
    if (isLoading || !isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      router.replace(ROUTES.HOME);
    } else if (!user && !inAuthGroup) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, segments, isLoading, isReady, router]);

  if (!isReady || isLoading) return null;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: loginMutation.isPending || signUpMutation.isPending,
        login: loginMutation.mutateAsync,
        signUp: signUpMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
