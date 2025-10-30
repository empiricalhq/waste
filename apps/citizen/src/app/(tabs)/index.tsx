import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/shared/header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useNextCollection } from "@/features/collections/hooks/use-next-collection";
import { useNearestTruck } from "@/features/trucks/hooks/use-nearest-truck";
import { NextCollectionCard } from "@/components/home/next-collection-card";
import { NearestTruckCard } from "@/components/home/nearest-truck-card";
import { QuickActions } from "@/components/home/quick-actions";
import { Spacing } from "@/constants/design-tokens";
import { ROUTES } from "@/constants/app-config";

export default function HomeScreen() {
  const router = useRouter();
  const { nextCollection, isLoading: isLoadingCollections } = useNextCollection();
  const { nearestTruck, isLoading: isLoadingTrucks } = useNearestTruck();

  const isLoading = isLoadingCollections || isLoadingTrucks;

  return (
    <View style={styles.container}>
      <Header title="Recolección de residuos" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {nextCollection ? (
            <NextCollectionCard collection={nextCollection} />
          ) : (
            <EmptyState title="No hay recolecciones próximas" />
          )}

          {nearestTruck && (
            <NearestTruckCard truck={nearestTruck} onTrack={() => router.push(ROUTES.TRUCK_MAP)} />
          )}

          <QuickActions
            onSchedulePress={() => router.push(ROUTES.SCHEDULE)}
            onContactPress={() => router.push(ROUTES.HELP)}
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
