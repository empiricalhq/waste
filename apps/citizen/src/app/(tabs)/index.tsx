import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NearestTruckCard } from '@/components/home/nearest-truck-card';
import { NextCollectionCard } from '@/components/home/next-collection-card';
import { QuickActions } from '@/components/home/quick-actions';
import { ErrorState } from '@/components/shared/error-state';
import { Header } from '@/components/shared/header';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/constants/app-config';
import { Spacing } from '@/constants/design-tokens';
import { useNextCollection } from '@/features/collections/hooks/use-next-collection';
import { useNearestTruck } from '@/features/trucks/hooks/use-nearest-truck';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';

export default function HomeScreen() {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const {
    nextCollection,
    isLoading: isLoadingCollections,
    error: collectionsError,
    refetch: refetchCollections,
  } = useNextCollection();
  const { nearestTruck, isLoading: isLoadingTrucks, error: trucksError, refetch: refetchTrucks } = useNearestTruck();

  const isLoading = isLoadingCollections || isLoadingTrucks;
  const hasError = collectionsError || trucksError;

  const handleRetry = () => {
    refetchCollections();
    refetchTrucks();
  };

  return (
    <View style={styles.container}>
      <Header title="Recolección de residuos" />
      {isLoading ? (
        <View style={styles.content}>
          <ListSkeleton count={2} />
        </View>
      ) : hasError ? (
        <ErrorState error={collectionsError || trucksError} onRetry={handleRetry} isOffline={isOffline} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {nextCollection ? (
            <NextCollectionCard collection={nextCollection} />
          ) : (
            <EmptyState title="No hay recolecciones próximas" />
          )}

          {nearestTruck && <NearestTruckCard truck={nearestTruck} />}

          <QuickActions
            onSchedulePress={() => router.push(ROUTES.SCHEDULE)}
            onMapPress={() => router.push(ROUTES.TRUCK_MAP)}
            onHelpPress={() => router.push(ROUTES.HELP)}
          />
        </ScrollView>
      )}
    </View>
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
