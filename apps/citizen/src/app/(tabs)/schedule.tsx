import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useCollections } from "@/features/collections/hooks/use-collections";
import { Header } from "@/components/shared/header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { WASTE_TYPES } from "@/constants/waste-types";
import { Spacing, Typography } from "@/constants/design-tokens";
import { formatFullDate } from "@/lib/utils/date-helpers";
import { Collection } from "@/types";

export default function ScheduleScreen() {
  const { data: collections, isLoading } = useCollections();

  const renderItem = ({ item }: { item: Collection }) => {
    const wasteInfo = WASTE_TYPES[item.type];
    return (
      <Card style={[styles.card, item.completed && styles.completedCard]}>
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

  return (
    <View style={styles.container}>
      <Header title="Calendario de Recolección" />
      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No hay fechas de recolección disponibles." />}
        />
      )}
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
    borderRadius: 5,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    color: Spacing.textSecondary,
  },
});
