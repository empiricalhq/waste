import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WASTE_TYPES } from "../constants";
import { theme } from "../theme";
import type { QuizQuestion, WasteType } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface QuizGameProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export function QuizGame({ questions, onComplete }: QuizGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<WasteType | null>(null);
  const [score, setScore] = useState(0);

  const question = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = (answer: WasteType) => {
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore =
        selectedAnswer === question.correctAnswer ? score + 1 : score;
      onComplete(finalScore);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Pregunta {currentIndex + 1} de {questions.length}
      </Text>

      <Image source={{ uri: question.imageUrl }} style={styles.image} />

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>¿Dónde va esto?</Text>
        <Text style={styles.item}>{question.item}</Text>
      </View>

      <View style={styles.options}>
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = isAnswered && option === question.correctAnswer;
          const isWrong = isAnswered && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={option}
              onPress={() => !isAnswered && handleAnswer(option)}
              disabled={isAnswered}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.option,
                  isCorrect && styles.correctOption,
                  isWrong && styles.wrongOption,
                ]}
              >
                <Text style={styles.optionText}>
                  {WASTE_TYPES[option].label}
                </Text>
                {isCorrect && <Text style={styles.indicator}>✓</Text>}
                {isWrong && <Text style={styles.indicator}>✗</Text>}
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAnswered && (
        <Button
          title={isLastQuestion ? "Ver resultados" : "Siguiente"}
          onPress={handleNext}
          fullWidth={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  progress: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  questionContainer: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  questionText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  item: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  options: {
    gap: theme.spacing.md,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  indicator: {
    fontSize: theme.fontSize.lg,
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
});
