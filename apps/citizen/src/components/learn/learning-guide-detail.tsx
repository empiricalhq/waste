import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { LearningGuide } from "@/types";
import { Header } from "@/components/shared/header";
import { WASTE_TYPES } from "@/constants/waste-types";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";

interface LearningGuideDetailProps {
  guide: LearningGuide;
}

export const LearningGuideDetail: React.FC<LearningGuideDetailProps> = ({ guide }) => {
  const wasteInfo = WASTE_TYPES[guide.category];
  return (
    <View style={styles.container}>
      <Header title={guide.name} />
      <ScrollView>
        <Image source={{ uri: guide.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.badge}>
            <View style={[styles.dot, { backgroundColor: wasteInfo.color }]} />
            <Text style={styles.badgeText}>{wasteInfo.label}</Text>
          </View>
          <Text style={styles.description}>{guide.description}</Text>
          <Text style={styles.sectionTitle}>Ejemplos</Text>
          {guide.examples.map((example, index) => (
            <Text key={index} style={styles.exampleText}>
              • {example}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: Spacing.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
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
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  exampleText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
});
