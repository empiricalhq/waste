import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { LearnMenu } from "../components/learn-menu";
import { QuizGame } from "../components/quiz-game";
import { QuizResults } from "../components/quiz-results";
import { quizQuestions } from "../data/quiz-questions";
import { useQuizProgress } from "../hooks/use-quiz-progress";

type Screen = "menu" | "quiz" | "results";

export function LearnScreen() {
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
        return (
          <QuizResults score={score} onRestart={() => setScreen("menu")} />
        );
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
