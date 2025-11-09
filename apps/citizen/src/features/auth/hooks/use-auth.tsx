import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { deleteToken, getToken } from '@/lib/storage/secure-storage';
import type { User } from '@/types';
import { authService } from '../services/auth-service';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  authState: AuthState;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate hook for token validation to avoid nested effects
function useTokenValidation() {
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      try {
        const token = await getToken();

        if (!isMounted) {
          return;
        }

        if (!token) {
          setHasValidToken(false);
          setIsValidating(false);
          return;
        }

        // Try to fetch user with the token
        await queryClient.fetchQuery({
          queryKey: ['currentUser'],
          queryFn: authService.getCurrentUser,
        });

        if (isMounted) {
          setHasValidToken(true);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        // If token is invalid, clear it
        const error = err as { status?: number };
        if (error.status === 401) {
          await deleteToken();
          queryClient.setQueryData(['currentUser'], null);
        }
        setHasValidToken(false);
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  return { isValidating, hasValidToken };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isValidating, hasValidToken } = useTokenValidation();

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: hasValidToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Determine auth state
  const getAuthState = useCallback((): AuthState => {
    if (isValidating || (hasValidToken && isUserLoading)) {
      return 'loading';
    }
    if (hasValidToken && user && !error) {
      return 'authenticated';
    }
    return 'unauthenticated';
  }, [isValidating, hasValidToken, isUserLoading, user, error]);

  const authState = getAuthState();
  const isLoading = authState === 'loading';
  const isAuthenticated = authState === 'authenticated';

  const logout = useCallback(async () => {
    await authService.logout();
    queryClient.setQueryData(['currentUser'], null);
    queryClient.clear();
  }, [queryClient]);

  const value = {
    user: user ?? null,
    authState,
    isLoading,
    isAuthenticated,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
