import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { LearningGuide } from "@/types";
import { Card } from "@/components/ui/card";
import { WASTE_TYPES } from "@/constants/waste-types";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";

interface LearningRoadmapProps {
  guides: LearningGuide[];
  onSelectGuide: (guide: LearningGuide) => void;
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ guides, onSelectGuide }) => {
  return (
    <FlatList
      data={guides}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelectGuide(item)}>
          <Card style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.badge}>
              <View style={[styles.dot, { backgroundColor: WASTE_TYPES[item.category].color }]} />
              <Text style={styles.categoryText}>{WASTE_TYPES[item.category].label}</Text>
            </View>
          </Card>
        </TouchableOpacity>
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
    borderRadius: 4,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
