import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack, useRouter, useSegments } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { ANIMATION_DURATIONS } from "@/constants/animations";
import { AuthProvider, useAuth } from "@/features/auth/hooks/use-auth";
import { useConnectionRecovery } from "@/lib/hooks/use-connection-recovery";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { AppError } from "@/lib/utils/error-handler";

const APP_VERSION = "1.0.0";

// time constants to avoid magic numbers
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_RETRIES = 3;
const MAX_RETRY_DELAY_MS = 30_000; // 30s
const STALE_TIME_MINUTES = 5;
const STALE_TIME_MS = STALE_TIME_MINUTES * MINUTE_MS; // 5 minutes
const GC_TIME_MINUTES = 10;
const GC_TIME_MS = GC_TIME_MINUTES * MINUTE_MS; // 10 minutes
const PERSIST_MAX_AGE_DAYS = 7;
const PERSIST_MAX_AGE_MS = PERSIST_MAX_AGE_DAYS * DAY_MS; // 7 days
const HTTP_STATUS_CLIENT_ERROR_MIN = 400;
const HTTP_STATUS_CLIENT_ERROR_MAX = 500;

preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // don't retry client errors (4xx)
        if (
          error instanceof AppError &&
          error.statusCode >= HTTP_STATUS_CLIENT_ERROR_MIN &&
          error.statusCode < HTTP_STATUS_CLIENT_ERROR_MAX
        ) {
          return false;
        }
        // retry up to 3 times for network errors and server errors
        return failureCount < MAX_RETRIES;
      },
      retryDelay: (attemptIndex) =>
        Math.min(SECOND_MS * 2 ** attemptIndex, MAX_RETRY_DELAY_MS), // 1s, 2s, 4s, max 30s

      // cache configuration
      staleTime: STALE_TIME_MS, // Consider data fresh for 5 minutes
      gcTime: GC_TIME_MS, // Keep unused data in cache for 10 minutes

      // offline behavior
      /* biome-disable security/no-secrets */
      networkMode: "offlineFirst",
      /* biome-enable security/no-secrets */
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1, // Retry mutations once
      /* biome-disable security/no-secrets */
      networkMode: "offlineFirst",
      /* biome-enable security/no-secrets */
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "REACT_QUERY_OFFLINE_CACHE",
  throttleTime: 1000, // Throttle writes to once per second
});

function RootLayoutNav() {
  const { isLoading, user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const router = useRouter();
  const segments = useSegments();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();

  useConnectionRecovery();

  useEffect(() => {
    if (!isLoading) {
      hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    // If the user is signed in and the initial segment is the auth group,
    // redirect them to the main app.
    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
    // If the user is not signed in and not in the auth group,
    // redirect them to login.
    else if (!(user || inAuthGroup)) {
      router.replace("/(auth)/login");
    }
  }, [user, segments, isLoading, router]);

  const handleRetry = () => {
    queryClient.refetchQueries({
      type: "active",
      stale: true,
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="truck-map"
          options={{
            presentation: "modal",
            animation: reducedMotion ? "fade" : "slide_from_bottom",
            animationDuration: reducedMotion
              ? ANIMATION_DURATIONS.QUICK
              : ANIMATION_DURATIONS.NORMAL,
          }}
        />
        <Stack.Screen name="help" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="terms" />
      </Stack>
      {isOffline && (
        <OfflineBanner isVisible={isOffline} onRetry={handleRetry} />
      )}
    </>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: PERSIST_MAX_AGE_MS, // 7 days
          buster: `${APP_VERSION}-${Platform.OS}`, // Clear cache on app update or platform change
        }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </GestureHandlerRootView>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}

export default RootLayout;
