import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { QuizGame } from "../../components/quiz-game";
import { Button } from "../../components/ui/button";
import { quizQuestions } from "../../data/quiz-questions";
import { useAuth } from "../../lib/auth";
import { storage } from "../../lib/storage";
import { theme } from "../../theme";

type Screen = "menu" | "quiz" | "results";

export default function LearnScreen() {
  const { isAuthenticated } = useAuth();
  const [screen, setScreen] = useState<Screen>("menu");
  const [score, setScore] = useState(0);

  const handleStartQuiz = () => {
    setScreen("quiz");
  };

  const handleQuizComplete = async (finalScore: number) => {
    setScore(finalScore);
    setScreen("results");

    if (isAuthenticated) {
      const progress = await storage.getQuizProgress();
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = progress.lastPlayed !== today;

      await storage.setQuizProgress({
        streak: isNewDay ? progress.streak + 1 : progress.streak,
        totalAnswered: progress.totalAnswered + quizQuestions.length,
        correctAnswers: progress.correctAnswers + finalScore,
        lastPlayed: today,
      });
    }
  };

  const handleRestart = () => {
    setScore(0);
    setScreen("menu");
  };

  if (screen === "quiz") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <QuizGame questions={quizQuestions} onComplete={handleQuizComplete} />
      </ScrollView>
    );
  }

  if (screen === "results") {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const message =
      percentage >= 80 ? "¡Excelente trabajo!" : "¡Sigue practicando!";

    return (
      <View style={styles.center}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Aprender</Text>
        <Text style={styles.description}>
          Aprende a clasificar diferentes tipos de residuos correctamente
        </Text>
        <Button
          title="Comenzar quiz"
          onPress={handleStartQuiz}
          fullWidth={true}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
