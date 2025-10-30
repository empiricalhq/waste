import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { WASTE_TYPES } from "@/constants/waste-types";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/design-tokens";
import { Check, X } from "lucide-react-native";

interface QuizViewProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onQuizComplete(score);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) return styles.option;
    if (option === currentQuestion.correctAnswer) return [styles.option, styles.correctOption];
    if (option === selectedAnswer) return [styles.option, styles.incorrectOption];
    return styles.option;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Pregunta {currentQuestionIndex + 1} de {questions.length}
      </Text>
      <Image source={{ uri: currentQuestion.imageUrl }} style={styles.image} />
      <Text style={styles.question}>{currentQuestion.question}</Text>
      <Text style={styles.item}>{currentQuestion.item}</Text>
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option) => (
          <TouchableOpacity
            key={option}
            style={getOptionStyle(option)}
            onPress={() => handleAnswer(option)}
            disabled={isAnswered}>
            <Text style={styles.optionText}>{WASTE_TYPES[option].label}</Text>
            {isAnswered && option === currentQuestion.correctAnswer && (
              <Check color={Colors.success} />
            )}
            {isAnswered &&
              option === selectedAnswer &&
              option !== currentQuestion.correctAnswer && <X color={Colors.error} />}
          </TouchableOpacity>
        ))}
      </View>
      {isAnswered && (
        <Button
          title={isLastQuestion ? "Finalizar" : "Siguiente"}
          onPress={handleNext}
          style={styles.nextButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  progress: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  question: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
    color: Colors.textSecondary,
  },
  item: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  correctOption: {
    borderColor: Colors.success,
    backgroundColor: "#E6F9F1",
  },
  incorrectOption: {
    borderColor: Colors.error,
    backgroundColor: "#FEEBEE",
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  nextButton: {
    marginTop: Spacing.xl,
  },
});
