import type React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AnimatedOption } from "@/components/learn/animated-option";
import { AnimatedProgressBar } from "@/components/learn/animated-progress-bar";
import { AnimatedResultsScreen } from "@/components/learn/animated-results-screen";
import { SuccessCelebration } from "@/components/learn/success-celebration";
import { OptimizedImage } from "@/components/shared/optimized-image";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ANIMATION_DURATIONS, EASING } from "@/constants/animations";
import { BorderRadius, Spacing } from "@/constants/design-tokens";
import { WASTE_TYPES } from "@/constants/waste-types";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import type { QuizQuestion } from "@/types";

interface QuizViewProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
}

const IMAGE_SCALE_INITIAL = 0.9;
const TRANSLATE_DISTANCE = 300;
const CELEBRATION_DISPLAY_MS = 2000;
const NEXT_BUTTON_INITIAL_Y = 50;

const QuizView: React.FC<QuizViewProps> = ({ questions, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(true);

  const reducedMotion = useReducedMotion();
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // question card animation
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const imageScale = useSharedValue(IMAGE_SCALE_INITIAL);

  // entrance animation for new question
  useEffect(() => {
    setIsQuestionVisible(true);

    if (reducedMotion) {
      translateX.value = 0;
      opacity.value = 1;
      imageScale.value = 1;
    } else {
      translateX.value = TRANSLATE_DISTANCE;
      opacity.value = 0;
      imageScale.value = IMAGE_SCALE_INITIAL;

      translateX.value = withTiming(0, {
        duration: ANIMATION_DURATIONS.NORMAL,
        easing: EASING.OUT_CUBIC,
      });

      opacity.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.NORMAL,
      });

      imageScale.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.NORMAL,
        easing: EASING.OUT_CUBIC,
      });
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(opacity);
      cancelAnimation(imageScale);
    };
  }, [reducedMotion, imageScale, opacity, translateX]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setShowCelebration(true);

      // hide celebration after delay
      setTimeout(() => {
        setShowCelebration(false);
      }, CELEBRATION_DISPLAY_MS);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      // exit animation
      if (!reducedMotion) {
        translateX.value = withTiming(-TRANSLATE_DISTANCE, {
          duration: ANIMATION_DURATIONS.QUICK,
          easing: EASING.IN_OUT_CUBIC,
        });
        opacity.value = withTiming(0, {
          duration: ANIMATION_DURATIONS.QUICK,
        });
      }

      // wait for exit animation, then move to next question
      setTimeout(
        () => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setIsQuestionVisible(false);
        },
        reducedMotion ? 0 : ANIMATION_DURATIONS.QUICK,
      );
    }
  };

  const questionCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  // next button animation
  const nextButtonTranslateY = useSharedValue(NEXT_BUTTON_INITIAL_Y);
  const nextButtonOpacity = useSharedValue(0);

  useEffect(() => {
    if (isAnswered) {
      if (reducedMotion) {
        nextButtonTranslateY.value = 0;
        nextButtonOpacity.value = 1;
      } else {
        nextButtonTranslateY.value = withTiming(0, {
          duration: ANIMATION_DURATIONS.NORMAL,
          easing: EASING.OUT_CUBIC,
        });
        nextButtonOpacity.value = withTiming(1, {
          duration: ANIMATION_DURATIONS.NORMAL,
        });
      }
    } else {
      nextButtonTranslateY.value = NEXT_BUTTON_INITIAL_Y;
      nextButtonOpacity.value = 0;
    }

    return () => {
      cancelAnimation(nextButtonTranslateY);
      cancelAnimation(nextButtonOpacity);
    };
  }, [isAnswered, reducedMotion, nextButtonOpacity, nextButtonTranslateY]);

  const nextButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: nextButtonTranslateY.value }],
    opacity: nextButtonOpacity.value,
  }));

  if (showResults) {
    return (
      <AnimatedResultsScreen
        score={score}
        total={questions.length}
        onContinue={() => onQuizComplete(score)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedProgressBar
        current={currentQuestionIndex + (isAnswered ? 1 : 0)}
        total={questions.length}
        isCorrect={
          isAnswered && selectedAnswer === currentQuestion.correctAnswer
        }
      />

      <Animated.View style={[styles.questionCard, questionCardStyle]}>
        <Animated.View style={imageStyle}>
          <OptimizedImage
            source={{ uri: currentQuestion.imageUrl }}
            style={styles.image}
          />
        </Animated.View>
        <Text variant="bodyLarge" color="secondary" align="center">
          {currentQuestion.question}
        </Text>
        <Text
          variant="heading2"
          weight="bold"
          align="center"
          style={styles.item}
        >
          {currentQuestion.item}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <AnimatedOption
              key={option}
              label={WASTE_TYPES[option].label}
              isSelected={selectedAnswer === option}
              isCorrect={option === currentQuestion.correctAnswer}
              isAnswered={isAnswered}
              onPress={() => handleAnswer(option)}
              index={index}
              isVisible={isQuestionVisible}
            />
          ))}
        </View>

        {isAnswered && (
          <Animated.View style={[styles.nextButtonContainer, nextButtonStyle]}>
            <Button
              title={isLastQuestion ? "Ver Resultados" : "Siguiente"}
              onPress={handleNext}
            />
          </Animated.View>
        )}
      </Animated.View>

      <SuccessCelebration visible={showCelebration} streak={streak} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionCard: {
    flex: 1,
    padding: Spacing.lg,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  item: {
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  nextButtonContainer: {
    marginTop: Spacing.xl,
  },
});

export { QuizView };
