import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useQuiz, useUpdateProgress } from "@/hooks/use-quiz";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { theme } from "@/theme";
import { WASTE_TYPES } from "@/constants";

export default function LearnScreen() {
  const { user } = useAuth();
  const { data: questions = [], isLoading, error, refetch } = useQuiz();
  const { mutate: updateProgress } = useUpdateProgress();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  if (isLoading) return <Loading />;
  
  if (error) {
    return <ErrorMessage message="Error al cargar el quiz" onRetry={refetch} />;
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>No hay preguntas disponibles</Text>
      </View>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.resultsTitle}>Quiz completado</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.totalText}>/ {questions.length}</Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.message}>
          {percentage >= 80 ? "¡Excelente trabajo! 🌟" : "¡Sigue practicando! 💪"}
        </Text>
        <Button
          title="Reiniciar"
          onPress={() => {
            setCurrentIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setShowResults(false);
          }}
        />
      </View>
    );
  }

  const question = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      if (user) {
        updateProgress(score + (isCorrect ? 1 : 0));
      }
      setShowResults(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Pregunta {currentIndex + 1} de {questions.length}
      </Text>

      <Image source={{ uri: question.imageUrl }} style={styles.image} />
      
      <Text style={styles.question}>{question.question}</Text>
      <Text style={styles.item}>{question.item}</Text>

      <View style={styles.options}>
        {question.options.map((option) => {
          const selected = selectedAnswer === option;
          const correct = isAnswered && option === question.correctAnswer;
          const wrong = isAnswered && selected && !correct;

          return (
            <TouchableOpacity
              key={option}
              onPress={() => !isAnswered && handleAnswer(option)}
              disabled={isAnswered}
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
                {correct && <Text>✓</Text>}
                {wrong && <Text>✗</Text>}
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAnswered && (
        <Button
          title={currentIndex === questions.length - 1 ? "Ver resultados" : "Siguiente"}
          onPress={handleNext}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  progress: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  question: {
    fontSize: theme.text.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  item: {
    fontSize: theme.text.xxl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  options: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: theme.text.base,
    fontWeight: "500",
  },
  correctOption: {
    backgroundColor: "#E6F9F1",
    borderColor: theme.colors.success,
  },
  wrongOption: {
    backgroundColor: "#FEEBEE",
    borderColor: theme.colors.error,
  },
  resultsTitle: {
    fontSize: theme.text.xxxl,
    fontWeight: "700",
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
  scoreText: {
    fontSize: 64,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  totalText: {
    fontSize: theme.text.xl,
    color: theme.colors.textSecondary,
  },
  percentage: {
    fontSize: theme.text.xxl,
    fontWeight: "600",
  },
  message: {
    fontSize: theme.text.xl,
    fontWeight: "500",
    textAlign: "center",
  },
});
