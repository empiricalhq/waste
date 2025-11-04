import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { LearningRoadmap } from '@/components/learn/learning-roadmap';
import { QuizView } from '@/components/learn/quiz-view';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLearningGuides } from '@/features/learning/hooks/use-learning-guides';
import { useQuiz } from '@/features/learning/hooks/use-quiz';
import { useUpdateUserProgress } from '@/features/learning/hooks/use-user-progress';
// import { LearningGuide } from "@/types";

export default function LearnScreen() {
  const [mode, setMode] = useState<'roadmap' | 'quiz' | 'guide'>('roadmap');
  // const [selectedGuide, setSelectedGuide] = useState<LearningGuide | null>(null);

  const { data: guides, isLoading: isLoadingGuides } = useLearningGuides();
  const { data: questions, isLoading: isLoadingQuiz } = useQuiz();
  const { mutate: updateUserProgress } = useUpdateUserProgress();

  const handleQuizComplete = (score: number) => {
    updateUserProgress(score);
    Alert.alert('Quiz Finalizado', `¡Obtuviste ${score} respuestas correctas!`);
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
            <Button title="Empezar Quiz" onPress={() => setMode('quiz')} style={styles.quizButton} />
            {guides && <LearningRoadmap guides={guides} onSelectGuide={() => {}} />}
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Aprender a Reciclar" />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quizButton: {
    margin: 16,
  },
});
