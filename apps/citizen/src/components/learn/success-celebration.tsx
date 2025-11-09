import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { ANIMATION_DURATIONS } from '@/constants/animations';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface SuccessCelebrationProps {
  visible: boolean;
  streak?: number;
}

const CONFETTI_COUNT = 20;
const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(Math.random() * 300 - 150);
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
      withTiming(800, {
        duration: 2000,
        easing: Easing.out(Easing.quad),
      }),
    );

    rotate.value = withDelay(
      delay,
      withTiming(360 * 3, {
        duration: 2000,
      }),
    );

    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, {
        duration: 500,
      }),
    );
  }, [delay, reducedMotion, opacity, rotate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.confetti, animatedStyle]} />;
};

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ visible, streak = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const reducedMotion = useReducedMotion();

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
      translateY.value = 20;
    }
  }, [visible, reducedMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  const messages = ['¡Excelente!', '¡Muy bien!', '¡Correcto!', '¡Perfecto!', '¡Genial!', '¡Increíble!', '¡Fantástico!'];

  const message = streak >= 3 ? `¡Racha de ${streak}! 🔥` : messages[Math.floor(Math.random() * messages.length)];

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Confetti particles */}
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiParticle
          key={i}
          delay={i * 50}
          color={CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}
        />
      ))}

      {/* Success message */}
      <Animated.View style={[styles.messageContainer, animatedStyle]}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  messageContainer: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
});
