import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSegments } from "expo-router";
import {
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CONFIG, QUERY_KEYS, ROUTES } from "@/constants";
import type { LoginInput, SignUpInput, User } from "@/types";
import { api } from "./api";
import { storage } from "./storage";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<User>;
  signUp: (data: SignUpInput) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = memo<{ children: ReactNode }>(({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const segments = useSegments();

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
    staleTime: CONFIG.api.staleTime,
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

  const handleLogin = useCallback(
    (data: LoginInput) => {
      return loginMutation.mutateAsync(data);
    },
    [loginMutation],
  );

  const handleSignUp = useCallback(
    (data: SignUpInput) => {
      return signUpMutation.mutateAsync(data);
    },
    [signUpMutation],
  );

  const handleLogout = useCallback(() => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  useEffect(() => {
    if (isLoading || !isReady) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      router.replace(ROUTES.HOME);
    } else if (!(user || inAuthGroup)) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, segments, isLoading, isReady, router]);

  if (!isReady || isLoading) {
    return null;
  }

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading: loginMutation.isPending || signUpMutation.isPending,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

AuthProvider.displayName = "AuthProvider";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
