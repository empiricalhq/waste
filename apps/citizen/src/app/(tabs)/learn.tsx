import { memo, useCallback, useState, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Loading } from '@/components/ui/Loading';
import { WASTE_TYPES } from '@/constants';
import { useQuiz, useUpdateProgress } from '@/hooks/queries';
import { useAuth } from '@/lib/auth';
import type { WasteType } from '@/types';
import { theme } from '@/theme';

const QuestionView = memo<{
  question: {
    id: string;
    item: string;
    question: string;
    imageUrl: string;
    options: WasteType[];
    correctAnswer: WasteType;
  };
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}>(({ question, currentIndex, totalQuestions, selectedAnswer, onAnswer, onNext }) => {
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Pregunta {currentIndex + 1} de {totalQuestions}
      </Text>

      <Image source={{ uri: question.imageUrl }} style={styles.image} />

      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question.question}</Text>
        <Text style={styles.item}>{question.item}</Text>
      </View>

      <View style={styles.options}>
        {question.options.map(option => {
          const selected = selectedAnswer === option;
          const correct = isAnswered && option === question.correctAnswer;
          const wrong = isAnswered && selected && !correct;

          return (
            <TouchableOpacity
              key={option}
              onPress={() => !isAnswered && onAnswer(option)}
              disabled={isAnswered}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.option,
                  correct && styles.correctOption,
                  wrong && styles.wrongOption,
                ]}
              >
                <Text style={styles.optionText}>
                  {WASTE_TYPES[option].label}
                </Text>
                {correct && <Text style={styles.indicator}>✓</Text>}
                {wrong && <Text style={styles.indicator}>✗</Text>}
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAnswered && (
        <Button
          title={currentIndex === totalQuestions - 1 ? 'Ver resultados' : 'Siguiente'}
          onPress={onNext}
          fullWidth
        />
      )}
    </View>
  );
});

QuestionView.displayName = 'QuestionView';

const ResultsView = memo<{
  score: number;
  total: number;
  onRestart: () => void;
}>(({ score, total, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  const message = percentage >= 80 ? '¡Excelente trabajo!' : '¡Sigue practicando!';

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.resultsTitle}>Quiz completado</Text>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.totalText}>/ {total}</Text>
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
      <Text style={styles.message}>{message}</Text>
      <Button title="Reiniciar" onPress={onRestart} />
    </View>
  );
});

ResultsView.displayName = 'ResultsView';

export default memo(function LearnScreen() {
  const { user } = useAuth();
  const { data: questions = [], isLoading, error, refetch } = useQuiz();
  const { mutate: updateProgress } = useUpdateProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  const handleAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentQuestion?.correctAnswer) {
      setScore(prev => prev + 1);
    }
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex === questions.length - 1) {
      if (user) {
        const finalScore = score + (selectedAnswer === currentQuestion?.correctAnswer ? 0 : 0);
        updateProgress(finalScore);
      }
      setShowResults(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    }
  }, [currentIndex, questions.length, score, selectedAnswer, currentQuestion, user, updateProgress]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResults(false);
  }, []);

  if (isLoading) {
    return <Loading message="Cargando preguntas..." />;
  }

  if (error) {
    return <ErrorMessage message="Error al cargar el quiz" onRetry={refetch} />;
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No hay preguntas disponibles</Text>
      </View>
    );
  }

  if (showResults) {
    return <ResultsView score={score} total={questions.length} onRestart={handleRestart} />;
  }

  return (
    <QuestionView
      question={currentQuestion}
      currentIndex={currentIndex}
      totalQuestions={questions.length}
      selectedAnswer={selectedAnswer}
      onAnswer={handleAnswer}
      onNext={handleNext}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  progress: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontWeight: theme.fontWeight.medium,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  questionContainer: {
    marginBottom: theme.spacing.xl,
  },
  question: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  item: {
    fontSize: theme.text.xxl,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    color: theme.colors.text,
  },
  options: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: theme.text.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  indicator: {
    fontSize: theme.text.lg,
    fontWeight: theme.fontWeight.bold,
  },
  correctOption: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  wrongOption: {
    backgroundColor: theme.colors.errorLight,
    borderColor: theme.colors.error,
  },
  resultsTitle: {
    fontSize: theme.text.xxxl,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 64,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  totalText: {
    fontSize: theme.text.xl,
    color: theme.colors.textSecondary,
  },
  percentage: {
    fontSize: theme.text.xxl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.text.lg,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
  },
});
