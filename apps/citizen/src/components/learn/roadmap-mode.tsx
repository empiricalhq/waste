import type React from "react";
import { StyleSheet, View } from "react-native";
import { LearningRoadmap } from "@/components/learn/learning-roadmap";
import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/design-tokens";
import type { LearningGuide } from "@/types";

interface RoadmapModeProps {
  guides: LearningGuide[];
  onStartQuiz: () => void;
}

const RoadmapMode: React.FC<RoadmapModeProps> = ({ guides, onStartQuiz }) => {
  return (
    <View style={styles.container}>
      <Button
        title="Empezar quiz"
        onPress={onStartQuiz}
        style={styles.quizButton}
      />
      <LearningRoadmap guides={guides} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quizButton: {
    margin: Spacing.lg,
  },
});

export { RoadmapMode };
