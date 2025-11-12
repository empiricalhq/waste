import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedCard } from "@/components/ui/animated-card";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { WASTE_TYPES } from "@/constants/waste-types";
import type { Truck } from "@/types";

interface NearestTruckCardProps {
  truck: Truck;
  index?: number;
}

const NearestTruckCardComponent = ({
  truck,
  index = 1,
}: NearestTruckCardProps) => {
  return (
    <AnimatedCard index={index}>
      <Text style={styles.label}>Camión Cercano</Text>
      <View style={styles.content}>
        <View style={styles.info}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  WASTE_TYPES[truck.type as keyof typeof WASTE_TYPES].color,
              },
            ]}
          />
          <View>
            <Text style={styles.typeText}>{WASTE_TYPES[truck.type].label}</Text>
            <Text style={styles.routeText}>{truck.route}</Text>
          </View>
        </View>
        <View style={styles.eta}>
          <Text style={styles.etaNumber}>{truck.eta}</Text>
          <Text style={styles.etaLabel}>min</Text>
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  label: {
    color: Colors.textSecondary,
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
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  routeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
  },
});

const NearestTruckCard = React.memo<NearestTruckCardProps>(
  NearestTruckCardComponent,
);

/* biome-disable security/no-secrets */
NearestTruckCard.displayName = "NearestTruckCard";
/* biome-enable security/no-secrets */

export { NearestTruckCard };
