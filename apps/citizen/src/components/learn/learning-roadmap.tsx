import type React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { WASTE_TYPES } from "@/constants/waste-types";
import type { LearningGuide } from "@/types";

interface LearningRoadmapProps {
  guides: LearningGuide[];
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ guides }) => {
  return (
    <FlatList
      data={guides}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.badge}>
            <View
              style={[
                styles.dot,
                { backgroundColor: WASTE_TYPES[item.category].color },
              ]}
            />
            <Text style={styles.categoryText}>
              {WASTE_TYPES[item.category].label}
            </Text>
          </View>
        </Card>
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "flex-start",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
