import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ANIMATION_DURATIONS, FEEDBACK_COLORS, SPRING_CONFIGS } from '@/constants/animations';
import { BorderRadius, Colors, Spacing } from '@/constants/design-tokens';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface AnimatedProgressBarProps {
  current: number;
  total: number;
  isCorrect?: boolean;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ current, total, isCorrect }) => {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const backgroundColor = useSharedValue<string>(Colors.primary);

  useEffect(() => {
    const targetProgress = (current / total) * 100;

    if (reducedMotion) {
      progress.value = targetProgress;
    } else {
      progress.value = withSpring(targetProgress, SPRING_CONFIGS.DEFAULT);
    }
  }, [
    current,
    total,
    reducedMotion,
    progress,
  ]);

  // Flash success color when answer is correct
  useEffect(() => {
    if (isCorrect && !reducedMotion) {
      backgroundColor.value = withSequence(
        withTiming(FEEDBACK_COLORS.success.border, { duration: 100 }),
        withTiming(Colors.primary, { duration: ANIMATION_DURATIONS.NORMAL }),
      );
    }
  }, [isCorrect, reducedMotion, backgroundColor]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value / 100 }],
    backgroundColor: backgroundColor.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    transformOrigin: 'left',
  },
});
