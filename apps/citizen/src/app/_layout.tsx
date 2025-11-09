import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { OfflineBanner } from '@/components/shared/offline-banner';
import { AuthProvider, useAuth } from '@/features/auth/hooks/use-auth';
import { useConnectionRecovery } from '@/lib/hooks/use-connection-recovery';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';
import { AppError } from '@/lib/utils/error-handler';

const APP_VERSION = '1.0.0';

SplashScreen.preventAutoHideAsync();

// Configure React Query for offline-first behavior
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx)
        if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        // Retry up to 3 times for network errors and server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000), // 1s, 2s, 4s, max 30s

      // Cache configuration
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes

      // Offline behavior
      networkMode: 'offlineFirst', // Use cache when offline
      refetchOnReconnect: true, // Auto-refetch when connection restored
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
    },
    mutations: {
      retry: 1, // Retry mutations once
      networkMode: 'offlineFirst',
    },
  },
});

// Create AsyncStorage persister for cache persistence
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  throttleTime: 1000, // Throttle writes to once per second
});

function RootLayoutNav() {
  const { isLoading, user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const router = useRouter();
  const segments = useSegments();
  const queryClient = useQueryClient();

  // Enable connection recovery
  useConnectionRecovery();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is signed in and the initial segment is the auth group,
    // redirect them to the main app.
    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // If the user is not signed in and not in the auth group,
    // redirect them to login.
    else if (!(user || inAuthGroup)) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, isLoading, router]);

  const handleRetry = () => {
    queryClient.refetchQueries({
      type: 'active',
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
        <Stack.Screen name="truck-map" />
        <Stack.Screen name="help" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="terms" />
      </Stack>
      {isOffline && <OfflineBanner isVisible={isOffline} onRetry={handleRetry} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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
