import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/design-tokens';
import { LearningRoadmap } from '@/components/learn/learning-roadmap';
import { QuizView } from '@/components/learn/quiz-view';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ROUTES } from '@/constants/app-config';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLearningGuides } from '@/features/learning/hooks/use-learning-guides';
import { useQuiz } from '@/features/learning/hooks/use-quiz';
import { useUpdateUserProgress } from '@/features/learning/hooks/use-user-progress';

export default function LearnScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'roadmap' | 'quiz' | 'guide'>('roadmap');
  // const [selectedGuide, setSelectedGuide] = useState<LearningGuide | null>(null);

  const { data: guides, isLoading: isLoadingGuides } = useLearningGuides();
  const { data: questions, isLoading: isLoadingQuiz } = useQuiz();
  const { mutate: updateUserProgress } = useUpdateUserProgress();

  const handleQuizComplete = (score: number) => {
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
  };

  const renderContent = () => {
    if (isLoadingGuides || isLoadingQuiz) {
      return <LoadingSpinner fullScreen={true} />;
    }
    switch (mode) {
      case 'quiz':
        return questions ? <QuizView questions={questions} onQuizComplete={handleQuizComplete} /> : null;
      default:
        return (
          <>
            <Button title="Empezar quiz" onPress={() => setMode('quiz')} style={styles.quizButton} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quizButton: {
    margin: Spacing.lg,
  },
});
