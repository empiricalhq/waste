import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { quizQuestions } from "@/features/quiz/data/quiz-questions";
import { theme } from "@/theme";

interface QuizResultsProps {
  score: number;
  onRestart: () => void;
  streakIncreased: boolean;
}

export function QuizResults({
  score,
  onRestart,
  streakIncreased,
}: QuizResultsProps) {
  const percentage = Math.round((score / quizQuestions.length) * 100);

  const getMessage = () => {
    if (percentage === 100) {
      return "¡Perfecto!";
    }
    if (percentage >= 80) {
      return "¡Excelente trabajo!";
    }
    if (percentage >= 60) {
      return "¡Buen trabajo!";
    }
    return "Sigue practicando";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz completado</Text>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreTotal}>/ {quizQuestions.length}</Text>
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
      <Text style={styles.message}>{getMessage()}</Text>
      {streakIncreased && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>¡Racha activa!</Text>
        </View>
      )}
      <Button title="Volver a intentar" onPress={onRestart} fullWidth={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.card,
    borderWidth: 8,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadow.lg,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  scoreTotal: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textSecondary,
  },
  percentage: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
});
