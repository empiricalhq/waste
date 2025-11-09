import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { ANIMATION_DURATIONS, EASING, SPRING_CONFIGS } from '@/constants/animations';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedResultsScreenProps {
  score: number;
  total: number;
  onContinue: () => void;
}

export const AnimatedResultsScreen: React.FC<AnimatedResultsScreenProps> = ({ score, total, onContinue }) => {
  const reducedMotion = useReducedMotion();
  const percentage = Math.round((score / total) * 100);

  // Animation values
  const displayScore = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.8);

  // Confetti for high scores
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      displayScore.value = score;
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
    } else {
      // Entrance animation
      opacity.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.NORMAL,
      });

      scale.value = withSpring(1, SPRING_CONFIGS.DEFAULT);

      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATIONS.NORMAL,
        easing: EASING.OUT_CUBIC,
      });

      // Score count-up animation
      displayScore.value = withDelay(
        300,
        withTiming(score, {
          duration: ANIMATION_DURATIONS.CELEBRATION,
          easing: EASING.OUT_CUBIC,
        }),
      );

      // Confetti for high scores (80%+)
      if (percentage >= 80) {
        confettiOpacity.value = withDelay(
          800,
          withSequence(withTiming(1, { duration: 300 }), withDelay(2000, withTiming(0, { duration: 500 }))),
        );
      }
    }
  }, [
    score,
    percentage,
    reducedMotion,
    confettiOpacity, // Score count-up animation
    displayScore, // Entrance animation
    opacity,
    scale,
    translateY,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const animatedScoreProps = useAnimatedProps(() => ({
    text: Math.round(displayScore.value).toString(),
  }));

  const getPerformanceMessage = () => {
    if (percentage === 100) {
      return '¡Perfecto! 🎉';
    }
    if (percentage >= 80) {
      return '¡Excelente trabajo! 🌟';
    }
    if (percentage >= 60) {
      return '¡Buen trabajo! 👍';
    }
    if (percentage >= 40) {
      return '¡Sigue practicando! 💪';
    }
    return '¡Inténtalo de nuevo! 📚';
  };

  const getStars = () => {
    if (percentage === 100) {
      return '⭐⭐⭐';
    }
    if (percentage >= 80) {
      return '⭐⭐';
    }
    if (percentage >= 60) {
      return '⭐';
    }
    return '';
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Quiz Completado!</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <AnimatedText style={styles.scoreText} animatedProps={animatedScoreProps} />
            <Text style={styles.totalText}>/ {total}</Text>
          </View>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <Text style={styles.stars}>{getStars()}</Text>
        <Text style={styles.message}>{getPerformanceMessage()}</Text>

        <View style={styles.buttonContainer}>
          <Button title="Continuar" onPress={onContinue} />
        </View>
      </View>

      {/* Confetti overlay for high scores */}
      {percentage >= 80 && (
        <Animated.View
          style={[
            styles.confettiContainer,
            {
              opacity: confettiOpacity,
            },
          ]}
          pointerEvents="none"
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 30} />
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(Math.random() * 400 - 200);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(1000, {
        duration: 2500,
        easing: Easing.out(Easing.quad),
      }),
    );

    rotate.value = withDelay(
      delay,
      withTiming(360 * 4, {
        duration: 2500,
      }),
    );

    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, {
        duration: 500,
      }),
    );
  }, [delay, opacity, rotate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return <Animated.View style={[styles.confettiParticle, animatedStyle, { backgroundColor: color }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xxl,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  totalText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textSecondary,
  },
  percentageText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  stars: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  message: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  confettiParticle: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
