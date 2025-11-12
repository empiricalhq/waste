import { memo, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Loading } from "@/components/ui/Loading";
import { WASTE_TYPES } from "@/constants";
import { useNearestTruck, useNextCollection } from "@/hooks/queries";
import { useNetwork } from "@/hooks/use-network";
import { theme } from "@/theme";

const CollectionCard = memo<{
  collection: NonNullable<ReturnType<typeof useNextCollection>["data"]>;
}>(({ collection }) => {
  const wasteType = WASTE_TYPES[collection.type];

  return (
    <Card variant="elevated" style={styles.section}>
      <Text style={styles.label}>Próxima recolección</Text>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: wasteType.color }]} />
        <View style={styles.info}>
          <Text style={styles.type}>{wasteType.label}</Text>
          <Text style={styles.time}>
            {collection.date} · {collection.time}
          </Text>
        </View>
      </View>
    </Card>
  );
});

CollectionCard.displayName = "CollectionCard";

const TruckCard = memo<{
  truck: NonNullable<ReturnType<typeof useNearestTruck>["nearestTruck"]>;
}>(({ truck }) => {
  const wasteType = WASTE_TYPES[truck.type];

  return (
    <Card variant="elevated" style={styles.section}>
      <Text style={styles.label}>Camión cercano</Text>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: wasteType.color }]} />
        <View style={styles.infoFlex}>
          <View>
            <Text style={styles.type}>{wasteType.label}</Text>
            <Text style={styles.time}>{truck.route}</Text>
          </View>
          <View style={styles.etaContainer}>
            <Text style={styles.eta}>{truck.eta}</Text>
            <Text style={styles.etaLabel}>min</Text>
          </View>
        </View>
      </View>
    </Card>
  );
});

TruckCard.displayName = "TruckCard";

export default memo(function HomeScreen() {
  const {
    data: nextCollection,
    isLoading: loadingCollection,
    error: collectionError,
    refetch: refetchCollection,
  } = useNextCollection();

  const {
    nearestTruck,
    isLoading: loadingTruck,
    error: truckError,
    refetch: refetchTruck,
  } = useNearestTruck();

  const { isOffline } = useNetwork();

  const isLoading = loadingCollection || loadingTruck;
  const hasError = collectionError || truckError;

  const handleRefresh = useMemo(() => {
    return () => {
      refetchCollection();
      refetchTruck();
    };
  }, [refetchCollection, refetchTruck]);

  if (isLoading) {
    return <Loading />;
  }

  if (hasError) {
    return (
      <ErrorMessage
        message={
          isOffline ? "Sin conexión a internet" : "Error al cargar información"
        }
        isOffline={isOffline}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.header}>Inicio</Text>

      {nextCollection && <CollectionCard collection={nextCollection} />}
      {nearestTruck && <TruckCard truck={nearestTruck} />}

      {!(nextCollection || nearestTruck) && (
        <Card>
          <Text style={styles.emptyText}>
            No hay información disponible en este momento
          </Text>
        </Card>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    fontSize: theme.text.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontWeight: theme.fontWeight.medium,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  info: {
    flex: 1,
  },
  infoFlex: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  type: {
    fontSize: theme.text.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  time: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
  },
  etaContainer: {
    alignItems: "flex-end",
  },
  eta: {
    fontSize: theme.text.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  etaLabel: {
    fontSize: theme.text.xs,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
