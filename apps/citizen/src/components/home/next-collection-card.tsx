import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Collection } from "@/types";
import { WASTE_TYPES } from "@/constants/waste-types";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";
import { formatDate } from "@/lib/utils/date-helpers";

interface NextCollectionCardProps {
  collection: Collection;
}

export const NextCollectionCard: React.FC<NextCollectionCardProps> = ({ collection }) => {
  const wasteInfo = WASTE_TYPES[collection.type];
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.label}>Próxima Recolección</Text>
        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
          <Text style={styles.badgeText}>{wasteInfo.label}</Text>
        </View>
      </View>
      <Text style={styles.date}>
        {formatDate(collection.date)} a las {collection.time}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  date: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
});
