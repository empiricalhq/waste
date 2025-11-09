import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { deleteToken, getToken } from '@/lib/storage/secure-storage';
import type { User } from '@/types';
import { authService } from '../services/auth-service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const {
    data: user,
    isLoading: isUserLoading,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      try {
        const token = await getToken();
        if (token) {
          // Fetch user data with the stored token
          await queryClient.fetchQuery({
            queryKey: ['currentUser'],
            queryFn: authService.getCurrentUser,
          });
        }
      } catch (err) {
        // If token is invalid (401), clear it
        const error = err as { status?: number };
        if (error.status === 401) {
          await deleteToken();
          queryClient.setQueryData(['currentUser'], null);
        }
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkTokenAndFetchUser();
  }, [queryClient]);

  // Handle 401 errors during query execution
  useEffect(() => {
    if (error) {
      const err = error as { status?: number };
      if (err.status === 401) {
        deleteToken();
        queryClient.setQueryData(['currentUser'], null);
      }
    }
  }, [error, queryClient]);

  const logout = async () => {
    await authService.logout();
    queryClient.setQueryData(['currentUser'], null);
  };

  const isLoading = isCheckingToken || (isUserLoading && !isSuccess);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
