import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getToken } from '@/lib/storage/secure-storage';
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
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: false,
    retry: 1,
  });

  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      try {
        const token = await getToken();
        if (token) {
          queryClient
            .getQueryCache()
            .find({ queryKey: ['currentUser'] })
            ?.fetch();
        }
      } catch (_e) {
      } finally {
        setIsCheckingToken(false);
      }
    };

    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    checkTokenAndFetchUser();
  }, [queryClient]);

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
