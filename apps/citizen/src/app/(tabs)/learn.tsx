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
import type { LearningGuide, QuizQuestion } from "@/types";

function useLearnScreenState() {
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
  const hasError = Boolean(guidesError || quizError);

  const handleRetry = useCallback(() => {
    refetchGuides();
    refetchQuiz();
  }, [refetchGuides, refetchQuiz]);

  const handleQuizComplete = useCallback(
    (score: number) => {
      if (user) {
        updateUserProgress(score);
      }
      setQuizScore({ score, total: questions?.length ?? 0 });
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

  const handleStartQuiz = useCallback(() => setMode("quiz"), []);

  return {
    user,
    router,
    isOffline,
    reducedMotion,
    mode,
    setMode,
    isLoading,
    hasError,
    guides,
    questions,
    guidesError,
    quizError,
    quizScore,
    showCompletionModal,
    handleRetry,
    handleQuizComplete,
    handleModalContinue,
    handleModalSignUp,
    handleStartQuiz,
  };
}

function RenderContent({
  isLoading,
  hasError,
  isOffline,
  reducedMotion,
  mode,
  questions,
  guides,
  guidesError,
  quizError,
  onRetry,
  onQuizComplete,
  onStartQuiz,
}: {
  isLoading: boolean;
  hasError: boolean;
  isOffline: boolean;
  reducedMotion: boolean;
  mode: "roadmap" | "quiz";
  questions?: QuizQuestion[];
  guides?: LearningGuide[];
  guidesError?: Error | null;
  quizError?: Error | null;
  onRetry: () => void;
  onQuizComplete: (score: number) => void;
  onStartQuiz: () => void;
}) {
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
        error={(guidesError || quizError) ?? null}
        onRetry={onRetry}
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
        <QuizMode questions={questions} onQuizComplete={onQuizComplete} />
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
        <RoadmapMode guides={guides} onStartQuiz={onStartQuiz} />
      </Animated.View>
    );
  }

  return null;
}

function LearnScreenContent() {
  const s = useLearnScreenState();
  return (
    <View style={styles.container}>
      <Header title="Aprender a reciclar" />
      <RenderContent
        isLoading={s.isLoading}
        hasError={s.hasError}
        isOffline={s.isOffline}
        reducedMotion={s.reducedMotion}
        mode={s.mode}
        questions={s.questions}
        guides={s.guides}
        guidesError={s.guidesError ?? null}
        quizError={s.quizError ?? null}
        onRetry={s.handleRetry}
        onQuizComplete={s.handleQuizComplete}
        onStartQuiz={s.handleStartQuiz}
      />
      <QuizCompletionModal
        visible={s.showCompletionModal}
        score={s.quizScore.score}
        total={s.quizScore.total}
        isAuthenticated={Boolean(s.user)}
        onContinue={s.handleModalContinue}
        onSignUp={s.handleModalSignUp}
      />
    </View>
  );
}

function LearnScreen() {
  return (
    <LearningFeatureWrapper>
      <LearnScreenContent />
    </LearningFeatureWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  modeContainer: { flex: 1 },
});

export default LearnScreen;
