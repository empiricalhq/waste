import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuizGame } from "@/features/quiz/components/quiz-game";
import { LearnMenu } from "@/features/quiz/components/learn-menu";
import { QuizResults } from "@/features/quiz/components/quiz-results";
import { quizQuestions } from "@/features/quiz/data/quiz-questions";
import { useQuizProgress } from "@/features/quiz/hooks/use-quiz-progress";
import { theme } from "@/theme";

type Screen = "menu" | "quiz" | "results";

export default function LearnScreen() {
  const { updateProgress } = useQuizProgress();
  const [screen, setScreen] = useState<Screen>("menu");
  const [score, setScore] = useState(0);

  const handleQuizComplete = async (finalScore: number) => {
    setScore(finalScore);
    await updateProgress(finalScore);
    setScreen("results");
  };

  const renderScreen = () => {
    switch (screen) {
      case "quiz":
        return (
          <QuizGame questions={quizQuestions} onComplete={handleQuizComplete} />
        );
      case "results":
        return <QuizResults score={score} onRestart={() => setScreen("menu")} />;
      case "menu":
      default:
        return <LearnMenu onStart={() => setScreen("quiz")} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        key={screen}
      >
        {renderScreen()}
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
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
});
