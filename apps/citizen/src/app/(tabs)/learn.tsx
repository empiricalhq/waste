import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { LearningRoadmap } from '@/components/learn/learning-roadmap';
import { QuizView } from '@/components/learn/quiz-view';
import { ErrorState } from '@/components/shared/error-state';
import { Header } from '@/components/shared/header';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/app-config';
import { Spacing } from '@/constants/design-tokens';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LearningFeatureWrapper } from '@/features/learning/components/learning-feature-wrapper';
import { useLearningGuides } from '@/features/learning/hooks/use-learning-guides';
import { useQuiz } from '@/features/learning/hooks/use-quiz';
import { useUpdateUserProgress } from '@/features/learning/hooks/use-user-progress';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';

function LearnScreenContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const [mode, setMode] = useState<'roadmap' | 'quiz'>('roadmap');

  const { data: guides, isLoading: isLoadingGuides, error: guidesError, refetch: refetchGuides } = useLearningGuides();
  const { data: questions, isLoading: isLoadingQuiz, error: quizError, refetch: refetchQuiz } = useQuiz();
  const { mutate: updateUserProgress } = useUpdateUserProgress();

  const isLoading = isLoadingGuides || isLoadingQuiz;
  const hasError = guidesError || quizError;

  const handleRetry = useCallback(() => {
    refetchGuides();
    refetchQuiz();
  }, [refetchGuides, refetchQuiz]);

  const handleQuizComplete = useCallback(
    (score: number) => {
      const message = `¡Obtuviste ${score} respuestas correctas!`;

      if (user) {
        updateUserProgress(score);
        Alert.alert('Quiz terminado', message);
      } else {
        Alert.alert('Quiz terminado', `${message}\n\n¿Quieres guardar tu progreso?`, [
          { text: 'Más tarde', style: 'cancel' },
          { text: 'Crear cuenta', onPress: () => router.push(ROUTES.SIGN_UP) },
        ]);
      }
      setMode('roadmap');
    },
    [user, updateUserProgress, router],
  );

  const handleStartQuiz = useCallback(() => {
    setMode('quiz');
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
      return <ErrorState error={guidesError || quizError} onRetry={handleRetry} isOffline={isOffline} />;
    }

    switch (mode) {
      case 'quiz':
        return questions ? <QuizView questions={questions} onQuizComplete={handleQuizComplete} /> : null;
      default:
        return (
          <>
            <Button title="Empezar quiz" onPress={handleStartQuiz} style={styles.quizButton} />
            {guides && <LearningRoadmap guides={guides} onSelectGuide={() => {}} />}
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Aprender a reciclar" />
      {renderContent()}
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
  quizButton: {
    margin: Spacing.lg,
  },
});
