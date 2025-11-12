import type React from "react";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { ANIMATION_DURATIONS } from "@/constants/animations";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface SuccessCelebrationProps {
  visible: boolean;
  streak?: number;
}

const CONFETTI_COUNT = 20;
const PARTICLE_INITIAL_Y = -100;
const PARTICLE_X_RANGE = 300;
const PARTICLE_X_OFFSET = 150;
const PARTICLE_TARGET_Y = 800;
const PARTICLE_DURATION = 2000;
const PARTICLE_ROTATION_MULTIPLIER = 3;
const PARTICLE_OPACITY_DELAY = 1500;
const PARTICLE_OPACITY_DURATION = 500;
const ROTATION_DEGREES = 360;
const CELEBRATION_INITIAL_Y = 20;
const ID_CHAR_BASE = 36;
const ID_SLICE_START = 2;
const ID_SLICE_END = 9;
const MIN_STREAK_FOR_RALLY = 3;
const CONFETTI_SPACING_SUCCESS = 50;
const CONFETTI_COLORS = [
  Colors.error, // Red
  "#4ECDC4", // Teal (decorative)
  Colors.info, // Blue
  "#FFA07A", // Light coral (decorative)
  "#98D8C8", // Mint (decorative)
  Colors.warning, // Yellow
];

const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({
  delay,
  color,
}) => {
  const translateY = useSharedValue(PARTICLE_INITIAL_Y);
  const translateX = useSharedValue(
    Math.random() * PARTICLE_X_RANGE - PARTICLE_X_OFFSET,
  );
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0;
      return;
    }

    translateY.value = withDelay(
      delay,
      withTiming(PARTICLE_TARGET_Y, {
        duration: PARTICLE_DURATION,
        easing: Easing.out(Easing.quad),
      }),
    );

    rotate.value = withDelay(
      delay,
      withTiming(ROTATION_DEGREES * PARTICLE_ROTATION_MULTIPLIER, {
        duration: PARTICLE_DURATION,
      }),
    );

    opacity.value = withDelay(
      delay + PARTICLE_OPACITY_DELAY,
      withTiming(0, {
        duration: PARTICLE_OPACITY_DURATION,
      }),
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      cancelAnimation(opacity);
    };
  }, [delay, reducedMotion, opacity, rotate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.confetti, animatedStyle]} />;
};

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  visible,
  streak = 0,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(CELEBRATION_INITIAL_Y);
  const reducedMotion = useReducedMotion();

  const confettiIds = useMemo<string[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }).map(() =>
        Math.random()
          .toString(ID_CHAR_BASE)
          .slice(ID_SLICE_START, ID_SLICE_END),
      ),
    [],
  );

  const messages = [
    "¡Excelente!",
    "¡Muy bien!",
    "¡Correcto!",
    "¡Perfecto!",
    "¡Genial!",
    "¡Increíble!",
    "¡Fantástico!",
  ];

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        opacity.value = 1;
        translateY.value = 0;
      } else {
        opacity.value = withTiming(1, {
          duration: ANIMATION_DURATIONS.NORMAL,
        });
        translateY.value = withTiming(0, {
          duration: ANIMATION_DURATIONS.NORMAL,
        });
      }
    } else {
      opacity.value = 0;
      translateY.value = CELEBRATION_INITIAL_Y;
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, [visible, reducedMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  const message =
    streak >= MIN_STREAK_FOR_RALLY
      ? `¡Racha de ${streak}! 🔥`
      : messages[Math.floor(Math.random() * messages.length)];

  return (
    <View style={styles.container} pointerEvents="none">
      {/* confetti particles */}
      {confettiIds.map((id, i) => (
        <ConfettiParticle
          key={id}
          delay={i * CONFETTI_SPACING_SUCCESS}
          color={
            CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
          }
        />
      ))}

      {/* success message */}
      <Animated.View style={[styles.messageContainer, animatedStyle]}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  confetti: {
    position: "absolute",
    top: 0,
    width: 10,
    height: 10,
    borderRadius: BorderRadius.sm,
  },
  messageContainer: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  message: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: "center",
  },
});

export { SuccessCelebration };
