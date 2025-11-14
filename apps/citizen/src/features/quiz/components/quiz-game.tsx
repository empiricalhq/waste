import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WASTE_TYPES } from "@/constants";
import { theme } from "@/theme";
import type { QuizQuestion, WasteType } from "@/types";

interface QuizGameProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function QuizGame({ questions, onComplete }: QuizGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<WasteType | null>(null);
  const [score, setScore] = useState(0);

  const imageScale = useSharedValue(0.9);
  const imageOpacity = useSharedValue(0);

  const question = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion = currentIndex === questions.length - 1;

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentIndex is the trigger to re-run the animation for each new question
  useEffect(() => {
    imageOpacity.value = withTiming(1, {
      duration: theme.animation.duration.slow,
    });
    imageScale.value = withSpring(1, theme.animation.easing.spring);
  }, [currentIndex]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const handleAnswer = (answer: WasteType) => {
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score);
    } else {
      imageOpacity.value = 0;
      imageScale.value = 0.9;
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Pregunta {currentIndex + 1} de {questions.length}
      </Text>

      <Animated.Image
        source={{ uri: question.imageUrl }}
        style={[styles.image, imageAnimatedStyle]}
      />

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
            <OptionButton
              key={option}
              option={option}
              isCorrect={isCorrect}
              isWrong={isWrong}
              isAnswered={isAnswered}
              onPress={() => !isAnswered && handleAnswer(option)}
            />
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

interface OptionButtonProps {
  option: WasteType;
  isCorrect: boolean;
  isWrong: boolean;
  isAnswered: boolean;
  onPress: () => void;
}

function OptionButton({
  option,
  isCorrect,
  isWrong,
  isAnswered,
  onPress,
}: OptionButtonProps) {
  const scale = useSharedValue(1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: isCorrect and isWrong are the triggers
  useEffect(() => {
    if (isCorrect) {
      scale.value = withSequence(
        withSpring(1.05, theme.animation.easing.spring),
        withSpring(1, theme.animation.easing.spring),
      );
    } else if (isWrong) {
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, theme.animation.easing.spring),
      );
    }
  }, [isCorrect, isWrong]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!isAnswered) {
      scale.value = withSequence(
        withSpring(0.96, theme.animation.easing.spring),
        withSpring(1, theme.animation.easing.spring),
      );
      onPress();
    }
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      disabled={isAnswered}
      activeOpacity={0.7}
      style={animatedStyle}
    >
      <Card
        style={[
          styles.option,
          isCorrect && styles.correctOption,
          isWrong && styles.wrongOption,
        ]}
      >
        <Text style={styles.optionText}>{WASTE_TYPES[option].label}</Text>
        {isCorrect && <Text style={styles.indicator}>✓</Text>}
        {isWrong && <Text style={styles.indicator}>✗</Text>}
      </Card>
    </AnimatedTouchable>
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
    borderWidth: 2,
  },
  wrongOption: {
    backgroundColor: theme.colors.errorLight,
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
});
