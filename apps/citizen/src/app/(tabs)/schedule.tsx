import { FlatList, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { ErrorState } from "@/components/shared/error-state";
import { Header } from "@/components/shared/header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { WASTE_TYPES } from "@/constants/waste-types";
import { useCollections } from "@/features/collections/hooks/use-collections";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { formatFullDate } from "@/lib/utils/date-helpers";
import type { Collection } from "@/types";

// Constants for time calculations
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const DAYS_TO_CONSIDER_OLD = 7;
const SEVEN_DAYS_MS = DAYS_TO_CONSIDER_OLD * DAY_MS;

function ScheduleScreen() {
  const { isOffline } = useNetworkStatus();
  const {
    data: collections,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useCollections();

  // check if data is older than 7 days
  // check if data is older than 7 days
  const isDataOld = dataUpdatedAt && Date.now() - dataUpdatedAt > SEVEN_DAYS_MS;

  const renderItem = ({ item }: { item: Collection }) => {
    const wasteInfo = WASTE_TYPES[item.type];
    const cardStyle: ViewStyle = item.completed
      ? { ...styles.card, ...styles.completedCard }
      : styles.card;
    return (
      <Card style={cardStyle}>
        <View style={styles.cardContent}>
          <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
          <View>
            <Text style={styles.typeText}>{wasteInfo.label}</Text>
            <Text style={styles.dateText}>
              {formatFullDate(item.date)} - {item.time}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View style={styles.list}>
        <ListSkeleton count={5} />
      </View>
    );
  } else if (error) {
    content = (
      <ErrorState error={error} onRetry={refetch} isOffline={isOffline} />
    );
  } else {
    content = (
      <>
        {isDataOld && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Los datos tienen más de 7 días. Conéctate para actualizar.
            </Text>
          </View>
        )}
        {dataUpdatedAt && (
          <View style={styles.timestampBanner}>
            <Text style={styles.timestampText}>
              Última actualización:{" "}
              {new Date(dataUpdatedAt).toLocaleString("es-PE")}
            </Text>
          </View>
        )}
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState title="No hay fechas de recolección disponibles." />
          }
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Calendario de Recolección" />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  completedCard: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  warningBanner: {
    backgroundColor: Colors.warning,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  warningText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
  timestampBanner: {
    padding: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  timestampText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
  },
});

export default ScheduleScreen;

// export after non-export statements
