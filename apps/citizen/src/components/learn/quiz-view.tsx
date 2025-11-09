import type React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AnimatedOption } from '@/components/learn/animated-option';
import { AnimatedProgressBar } from '@/components/learn/animated-progress-bar';
import { AnimatedResultsScreen } from '@/components/learn/animated-results-screen';
import { SuccessCelebration } from '@/components/learn/success-celebration';
import { OptimizedImage } from '@/components/shared/optimized-image';
import { Button } from '@/components/ui/button';
import { ANIMATION_DURATIONS, EASING } from '@/constants/animations';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';
import { WASTE_TYPES } from '@/constants/waste-types';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { QuizQuestion } from '@/types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onQuizComplete }) => {
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

  // Question card animation
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const imageScale = useSharedValue(0.9);

  // Entrance animation for new question
  useEffect(() => {
    setIsQuestionVisible(true);

    if (reducedMotion) {
      translateX.value = 0;
      opacity.value = 1;
      imageScale.value = 1;
    } else {
      translateX.value = 300;
      opacity.value = 0;
      imageScale.value = 0.9;

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

    // Cleanup animations on unmount
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

      // Hide celebration after delay
      setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      // Exit animation
      if (!reducedMotion) {
        translateX.value = withTiming(-300, {
          duration: ANIMATION_DURATIONS.QUICK,
          easing: EASING.IN_OUT_CUBIC,
        });
        opacity.value = withTiming(0, {
          duration: ANIMATION_DURATIONS.QUICK,
        });
      }

      // Wait for exit animation, then move to next question
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

  // Next button animation
  const nextButtonTranslateY = useSharedValue(50);
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
      nextButtonTranslateY.value = 50;
      nextButtonOpacity.value = 0;
    }

    // Cleanup animations on unmount
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
    return <AnimatedResultsScreen score={score} total={questions.length} onContinue={onQuizComplete} />;
  }

  return (
    <View style={styles.container}>
      <AnimatedProgressBar
        current={currentQuestionIndex + (isAnswered ? 1 : 0)}
        total={questions.length}
        isCorrect={isAnswered && selectedAnswer === currentQuestion.correctAnswer}
      />

      <Animated.View style={[styles.questionCard, questionCardStyle]}>
        <Animated.View style={imageStyle}>
          <OptimizedImage source={{ uri: currentQuestion.imageUrl }} style={styles.image} />
        </Animated.View>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        <Text style={styles.item}>{currentQuestion.item}</Text>

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
            <Button title={isLastQuestion ? 'Ver Resultados' : 'Siguiente'} onPress={handleNext} />
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
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  question: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  item: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.text,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  nextButtonContainer: {
    marginTop: Spacing.xl,
  },
});
