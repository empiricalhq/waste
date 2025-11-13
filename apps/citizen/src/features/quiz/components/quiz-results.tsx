import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { quizQuestions } from "@/features/quiz/data/quiz-questions";
import { theme } from "@/theme";

interface QuizResultsProps {
  score: number;
  onRestart: () => void;
}

export function QuizResults({ score, onRestart }: QuizResultsProps) {
  const { isAuthenticated } = useAuth();
  const isVisible = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible.value ? 1 : 0, { duration: theme.animation.duration.slow }),
    transform: [{ scale: withSpring(isVisible.value ? 1 : 0.9, theme.animation.easing.spring) }],
  }));

  const onLayout = () => {
    isVisible.value = true;
  };

  const percentage = Math.round((score / quizQuestions.length) * 100);
  const message = percentage >= 80 ? "¡Excelente trabajo!" : "¡Sigue practicando!";

  return (
    <Animated.View onLayout={onLayout} style={[styles.center, animatedStyle]}>
      <Text style={styles.title}>Quiz completado</Text>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreTotal}>/ {quizQuestions.length}</Text>
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
      <Text style={styles.message}>{message}</Text>
      {!isAuthenticated && (
        <Text style={styles.hint}>
          Inicia sesión para guardar tu progreso
        </Text>
      )}
      <Button title="Reintentar" onPress={onRestart} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
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
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
