import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { QuizCompletionModal } from "@/components/learn/quiz-completion-modal";
import { QuizMode } from "@/components/learn/quiz-mode";
import { RoadmapMode } from "@/components/learn/roadmap-mode";
import { ErrorState } from "@/components/shared/error-state";
import { Header } from "@/components/shared/header";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { ANIMATION_DURATIONS } from "@/constants/animations";
import { ROUTES } from "@/constants/app-config";
import { Spacing } from "@/constants/design-tokens";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { LearningFeatureWrapper } from "@/features/learning/components/learning-feature-wrapper";
import { useLearningGuides } from "@/features/learning/hooks/use-learning-guides";
import { useQuiz } from "@/features/learning/hooks/use-quiz";
import { useUpdateUserProgress } from "@/features/learning/hooks/use-user-progress";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

function LearnScreenContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<"roadmap" | "quiz">("roadmap");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });

  const {
    data: guides,
    isLoading: isLoadingGuides,
    error: guidesError,
    refetch: refetchGuides,
  } = useLearningGuides();
  const {
    data: questions,
    isLoading: isLoadingQuiz,
    error: quizError,
    refetch: refetchQuiz,
  } = useQuiz();
  const { mutate: updateUserProgress } = useUpdateUserProgress();

  const isLoading = isLoadingGuides || isLoadingQuiz;
  const hasError = guidesError || quizError;

  const handleRetry = useCallback(() => {
    refetchGuides();
    refetchQuiz();
  }, [refetchGuides, refetchQuiz]);

  const handleQuizComplete = useCallback(
    (score: number) => {
      if (user) {
        updateUserProgress(score);
      }
      setQuizScore({ score, total: questions?.length || 0 });
      setShowCompletionModal(true);
    },
    [user, updateUserProgress, questions],
  );

  const handleModalContinue = useCallback(() => {
    setShowCompletionModal(false);
    setMode("roadmap");
  }, []);

  const handleModalSignUp = useCallback(() => {
    setShowCompletionModal(false);
    router.push(ROUTES.SIGN_UP);
  }, [router]);

  const handleStartQuiz = useCallback(() => {
    setMode("quiz");
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <ListSkeleton count={3} />
        </View>
      );
    }

    if (hasError) {
      return (
        <ErrorState
          error={guidesError || quizError}
          onRetry={handleRetry}
          isOffline={isOffline}
        />
      );
    }

    if (mode === "quiz" && questions) {
      return (
        <Animated.View
          key="quiz-mode"
          entering={
            reducedMotion
              ? undefined
              : FadeIn.duration(ANIMATION_DURATIONS.NORMAL)
          }
          exiting={
            reducedMotion
              ? undefined
              : FadeOut.duration(ANIMATION_DURATIONS.QUICK)
          }
          style={styles.modeContainer}
        >
          <QuizMode questions={questions} onQuizComplete={handleQuizComplete} />
        </Animated.View>
      );
    }

    if (guides) {
      return (
        <Animated.View
          key="roadmap-mode"
          entering={
            reducedMotion
              ? undefined
              : FadeIn.duration(ANIMATION_DURATIONS.NORMAL)
          }
          exiting={
            reducedMotion
              ? undefined
              : FadeOut.duration(ANIMATION_DURATIONS.QUICK)
          }
          style={styles.modeContainer}
        >
          <RoadmapMode guides={guides} onStartQuiz={handleStartQuiz} />
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Header title="Aprender a reciclar" />
      {renderContent()}
      <QuizCompletionModal
        visible={showCompletionModal}
        score={quizScore.score}
        total={quizScore.total}
        isAuthenticated={Boolean(user)}
        onContinue={handleModalContinue}
        onSignUp={handleModalSignUp}
      />
    </View>
  );
}

export default function LearnScreen() {
  return (
    <LearningFeatureWrapper>
      <LearnScreenContent />
    </LearningFeatureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  modeContainer: {
    flex: 1,
  },
});
