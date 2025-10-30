import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Truck } from "@/types";
import { WASTE_TYPES } from "@/constants/waste-types";
import { Spacing, Typography } from "@/constants/design-tokens";

interface NearestTruckCardProps {
  truck: Truck;
}

export const NearestTruckCard: React.FC<NearestTruckCardProps> = ({ truck }) => {
  const wasteInfo = WASTE_TYPES[truck.type];
  return (
    <Card>
      <Text style={styles.label}>Camión Cercano</Text>
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
          <View>
            <Text style={styles.typeText}>{wasteInfo.label}</Text>
            <Text style={styles.routeText}>{truck.route}</Text>
          </View>
        </View>
        <View style={styles.eta}>
          <Text style={styles.etaNumber}>{truck.eta}</Text>
          <Text style={styles.etaLabel}>min</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  label: {
    color: Spacing.textSecondary,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  routeText: {
    fontSize: Typography.fontSize.sm,
    color: Spacing.textSecondary,
  },
  eta: {
    alignItems: "flex-end",
  },
  etaNumber: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  etaLabel: {
    fontSize: Typography.fontSize.xs,
    color: Spacing.textSecondary,
  },
});
