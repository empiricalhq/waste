import { memo, useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonCard } from "@/components/ui/Loading";
import { WASTE_TYPES } from "@/constants";
import { useCollections } from "@/hooks/queries";
import { useNetwork } from "@/hooks/use-network";
import { theme } from "@/theme";
import type { Collection } from "@/types";

const CollectionItem = memo<{ item: Collection }>(({ item }) => {
  const wasteType = WASTE_TYPES[item.type];

  return (
    <Card style={[styles.card, item.completed && styles.completed]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: wasteType.color }]} />
        <View>
          <Text style={styles.type}>{wasteType.label}</Text>
          <Text style={styles.time}>
            {item.date} · {item.time}
          </Text>
        </View>
      </View>
    </Card>
  );
});

CollectionItem.displayName = "CollectionItem";

const EmptyState = memo(() => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No hay recolecciones programadas</Text>
  </View>
));

EmptyState.displayName = "EmptyState";

export default memo(function ScheduleScreen() {
  const {
    data: collections = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCollections();
  const { isOffline } = useNetwork();

  const renderItem = useCallback(
    ({ item }: { item: Collection }) => <CollectionItem item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Collection) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Calendario</Text>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Calendario</Text>
        <ErrorMessage
          message={
            isOffline
              ? "Sin conexión a internet"
              : "Error al cargar el calendario"
          }
          isOffline={isOffline}
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendario</Text>
      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        contentContainerStyle={collections.length === 0 && styles.emptyList}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    fontSize: theme.text.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  completed: {
    opacity: 0.5,
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
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
