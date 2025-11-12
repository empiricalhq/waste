import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  // runOnJS,
  // useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Button } from "@/components/ui/button";
import {
  ANIMATION_DURATIONS,
  EASING,
  SPRING_CONFIGS,
} from "@/constants/animations";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const _AnimatedText = Animated.createAnimatedComponent(Text);

// Constants
const PERCENT_SCALE = 100;
const ENTRANCE_TRANSLATE_Y = 50;
const INITIAL_SCALE = 0.8;
const CONFETTI_COUNT = 30;
const CONFETTI_ID_SLICE_START = 2;
const CONFETTI_ID_SLICE_END = 9;
const SCORE_ANIMATION_DELAY = 300;
const CONFETTI_TRIGGER_PERCENT = 80;
const CONFETTI_DELAY = 800;
const CONFETTI_SEQUENCE_DELAY = 2000;
const CONFETTI_PARTICLE_DURATION = 2500;
const ID_CHAR_BASE = 36;
const CONFETTI_SPACING = 30;
const ROTATION_DEGREES = 360;
const CONFETTI_FADE_IN_DURATION = 300;
const CONFETTI_FADE_OUT_DURATION = 500;
const SCORE_TEXT_SCALE = 2.3;
const STARS_TEXT_SCALE = 1.7;
const STAR_PERCENT_TOP = 100;
const STAR_PERCENT_2 = 80;
const STAR_PERCENT_1 = 60;
const STAR_PERCENT_LOW = 40;

interface AnimatedResultsScreenProps {
  score: number;
  total: number;
  onContinue: () => void;
}

const AnimatedResultsScreen: React.FC<AnimatedResultsScreenProps> = ({
  score,
  total,
  onContinue,
}) => {
  const reducedMotion = useReducedMotion();
  const percentage = Math.round((score / total) * PERCENT_SCALE);

  // Animation values
  const displayScore = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(ENTRANCE_TRANSLATE_Y);
  const scale = useSharedValue(INITIAL_SCALE);

  // Confetti for high scores
  const confettiOpacity = useSharedValue(0);
  // use top-level constants ID_CHAR_BASE, CONFETTI_SPACING

  const confettiIds = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }).map(() =>
        Math.random()
          .toString(ID_CHAR_BASE)
          .slice(CONFETTI_ID_SLICE_START, CONFETTI_ID_SLICE_END),
      ),
    [],
  );

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

      // score count-up animation
      displayScore.value = withDelay(
        SCORE_ANIMATION_DELAY,
        withTiming(score, {
          duration: ANIMATION_DURATIONS.CELEBRATION,
          easing: EASING.OUT_CUBIC,
        }),
      );

      // confetti for high scores (80%+)
      if (percentage >= CONFETTI_TRIGGER_PERCENT) {
        confettiOpacity.value = withDelay(
          CONFETTI_DELAY,
          withSequence(
            withTiming(1, { duration: CONFETTI_FADE_IN_DURATION }),
            withDelay(
              CONFETTI_SEQUENCE_DELAY,
              withTiming(0, { duration: CONFETTI_FADE_OUT_DURATION }),
            ),
          ),
        );
      }
    }

    return () => {
      cancelAnimation(displayScore);
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(confettiOpacity);
    };
  }, [
    score,
    percentage,
    reducedMotion,
    confettiOpacity,
    displayScore,
    opacity,
    scale,
    translateY,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const [displayValue, setDisplayValue] = useState("0");
  useAnimatedReaction(
    () => Math.round(displayScore.value),
    (value) => {
      scheduleOnRN(() => setDisplayValue(value.toString()));
    },
  );

  const getPerformanceMessage = () => {
    if (percentage === STAR_PERCENT_TOP) {
      return "¡Perfecto! 🎉";
    }
    if (percentage >= STAR_PERCENT_2) {
      return "¡Excelente trabajo! 🌟";
    }
    if (percentage >= STAR_PERCENT_1) {
      return "¡Buen trabajo! 👍";
    }
    if (percentage >= STAR_PERCENT_LOW) {
      return "¡Sigue practicando! 💪";
    }
    return "¡Inténtalo de nuevo! 📚";
  };

  const getStars = () => {
    if (percentage === STAR_PERCENT_TOP) {
      return "⭐⭐⭐";
    }
    if (percentage >= STAR_PERCENT_2) {
      return "⭐⭐";
    }
    if (percentage >= STAR_PERCENT_1) {
      return "⭐";
    }
    return "";
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Quiz Completado!</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{displayValue}</Text>
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

      {/* confetti overlay for high scores */}
      {percentage >= CONFETTI_TRIGGER_PERCENT && (
        <Animated.View
          style={[
            styles.confettiContainer,
            {
              opacity: confettiOpacity,
            },
          ]}
          pointerEvents="none"
        >
          {confettiIds.map((id, i) => (
            <ConfettiParticle key={id} delay={i * CONFETTI_SPACING} />
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const ParticleInitialY = -100;
  const ParticleXRange = 400;
  const ParticleXOffset = 200;
  const ParticleTargetY = 1000;
  const ParticleRotationMultiplier = 4;

  const translateY = useSharedValue(ParticleInitialY);
  const translateX = useSharedValue(
    Math.random() * ParticleXRange - ParticleXOffset,
  );
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(ParticleTargetY, {
        duration: CONFETTI_PARTICLE_DURATION,
        easing: Easing.out(Easing.quad),
      }),
    );

    rotate.value = withDelay(
      delay,
      withTiming(ROTATION_DEGREES * ParticleRotationMultiplier, {
        duration: CONFETTI_PARTICLE_DURATION,
      }),
    );

    opacity.value = withDelay(
      delay + CONFETTI_SEQUENCE_DELAY,
      withTiming(0, {
        duration: CONFETTI_FADE_OUT_DURATION,
      }),
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      cancelAnimation(opacity);
    };
  }, [delay, opacity, rotate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = [
    Colors.error, // Red
    "#4ECDC4", // Teal (decorative)
    Colors.info, // Blue
    "#FFA07A", // Light coral (decorative)
    "#98D8C8", // Mint (decorative)
    Colors.warning, // Yellow
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        animatedStyle,
        { backgroundColor: color },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xxl,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  scoreText: {
    fontSize: Typography.fontSize.xxxl * SCORE_TEXT_SCALE, // ~64px
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
    fontSize: Typography.fontSize.xxxl * STARS_TEXT_SCALE, // ~48px
    marginBottom: Spacing.lg,
  },
  message: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  confettiParticle: {
    position: "absolute",
    top: 0,
    width: 12,
    height: 12,
    borderRadius: BorderRadius.sm,
  },
});

export { AnimatedResultsScreen };
