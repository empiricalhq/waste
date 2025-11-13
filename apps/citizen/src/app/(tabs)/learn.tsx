import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { QuizGame } from "@/features/quiz/components/quiz-game";
import { quizQuestions } from "@/features/quiz/data/quiz-questions";
import { useQuizProgress } from "@/features/quiz/hooks/use-quiz-progress";
import { theme } from "@/theme";

type Screen = "menu" | "quiz" | "results";

export default function LearnScreen() {
  const { isAuthenticated } = useAuth();
  const { updateProgress } = useQuizProgress();

  const [screen, setScreen] = useState<Screen>("menu");
  const [score, setScore] = useState(0);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: theme.animation.duration.slow });
    scale.value = withSpring(1, theme.animation.easing.spring);
  }, [screen]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleStartQuiz = () => {
    setScreen("quiz");
  };

  const handleQuizComplete = async (finalScore: number) => {
    setScore(finalScore);
    setScreen("results");

    if (isAuthenticated) {
      try {
        await updateProgress(finalScore);
      } catch (error) {
        console.error("handleQuizComplete failed:", error);
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    opacity.value = 0;
    scale.value = 0.9;
    setScreen("menu");
  };

  if (screen === "quiz") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <QuizGame questions={quizQuestions} onComplete={handleQuizComplete} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "results") {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const message =
      percentage >= 80 ? "¡Excelente trabajo!" : "¡Sigue practicando!";

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Animated.View style={[styles.center, animatedStyle]}>
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
          <Button title="Reintentar" onPress={handleRestart} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={animatedStyle}>
          <Text style={styles.title}>Aprender</Text>
          <Text style={styles.description}>
            Aprende a clasificar diferentes tipos de residuos correctamente
          </Text>
          <Button
            title="Comenzar quiz"
            onPress={handleStartQuiz}
            fullWidth={true}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
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
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
