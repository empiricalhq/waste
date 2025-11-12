import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { memo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CONFIG } from "@/constants";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: CONFIG.api.retryAttempts,
      staleTime: CONFIG.api.staleTime,
      gcTime: CONFIG.api.cacheTime,
    },
  },
});

export default memo(function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
});
