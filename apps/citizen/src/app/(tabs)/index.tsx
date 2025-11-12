import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { NearestTruckCard } from "@/components/home/nearest-truck-card";
import { NextCollectionCard } from "@/components/home/next-collection-card";
import { QuickActions } from "@/components/home/quick-actions";
import { ErrorState } from "@/components/shared/error-state";
import { Header } from "@/components/shared/header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/app-config";
import { Spacing } from "@/constants/design-tokens";
import { useNextCollection } from "@/features/collections/hooks/use-next-collection";
import { useNearestTruck } from "@/features/trucks/hooks/use-nearest-truck";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import type { Collection, Truck } from "@/types";

function HomeScreen() {
  const home = useHome();

  return (
    <View style={styles.container}>
      <Header title="Recolección de residuos" />
      <HomeView {...home} />
    </View>
  );
}

function useHome() {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const {
    nextCollection,
    isLoading: isLoadingCollections,
    error: collectionsError,
    refetch: refetchCollections,
  } = useNextCollection();
  const {
    nearestTruck,
    isLoading: isLoadingTrucks,
    error: trucksError,
    refetch: refetchTrucks,
  } = useNearestTruck();

  const isLoading = isLoadingCollections || isLoadingTrucks;
  const hasError = Boolean(collectionsError || trucksError);

  const handleRetry = useCallback(() => {
    refetchCollections();
    refetchTrucks();
  }, [refetchCollections, refetchTrucks]);

  const handleSchedulePress = useCallback(() => {
    router.push(ROUTES.SCHEDULE);
  }, [router]);

  const handleMapPress = useCallback(() => {
    router.push(ROUTES.TRUCK_MAP);
  }, [router]);

  const handleHelpPress = useCallback(() => {
    router.push(ROUTES.HELP);
  }, [router]);

  return {
    nextCollection,
    nearestTruck,
    isLoading,
    collectionsError,
    trucksError,
    isOffline,
    hasError,
    handleRetry,
    handleSchedulePress,
    handleMapPress,
    handleHelpPress,
  };
}

function HomeView({
  nextCollection,
  nearestTruck,
  isLoading,
  collectionsError,
  trucksError,
  isOffline,
  handleRetry,
  handleSchedulePress,
  handleMapPress,
  handleHelpPress,
}: {
  nextCollection?: Collection | null | undefined;
  nearestTruck?: Truck | null | undefined;
  isLoading: boolean;
  collectionsError: Error | null;
  trucksError: Error | null;
  isOffline: boolean;
  handleRetry: () => void;
  handleSchedulePress: () => void;
  handleMapPress: () => void;
  handleHelpPress: () => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.content}>
        <ListSkeleton count={2} />
      </View>
    );
  }

  if (collectionsError || trucksError) {
    return (
      <ErrorState
        error={collectionsError || trucksError}
        onRetry={handleRetry}
        isOffline={isOffline}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {nextCollection ? (
        <NextCollectionCard collection={nextCollection} />
      ) : (
        <EmptyState title="No hay recolecciones próximas" />
      )}

      {nearestTruck && <NearestTruckCard truck={nearestTruck} />}

      <QuickActions
        onSchedulePress={handleSchedulePress}
        onMapPress={handleMapPress}
        onHelpPress={handleHelpPress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xxl,
  },
});

export default HomeScreen;

// export after non-export statements
