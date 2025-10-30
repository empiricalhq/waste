import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth-service";
import { getToken } from "@/lib/storage/secure-storage";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: hasToken,
    retry: 1,
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      setHasToken(!!token);
    };
    checkToken();
  }, []);

  const logout = async () => {
    await authService.logout();
    queryClient.setQueryData(["currentUser"], null);
    setHasToken(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading || !hasToken,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
