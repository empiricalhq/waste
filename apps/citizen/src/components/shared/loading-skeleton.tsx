import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BorderRadius, Colors, Spacing } from '@/constants/design-tokens';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface CardSkeletonProps {
  animated?: boolean;
}

interface ListSkeletonProps {
  count?: number;
  animated?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ animated = true }) => {
  const opacity = useSharedValue(0.5);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (animated && !reducedMotion) {
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 600 }), withTiming(0.5, { duration: 600 })),
        -1, // Infinite repeat
        false,
      );
    }
  }, [animated, reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animated && !reducedMotion ? opacity.value : 0.5,
  }));

  return (
    <View style={styles.skeleton}>
      <Animated.View style={[styles.skeletonLine, styles.skeletonTitle, animatedStyle]} />
      <Animated.View style={[styles.skeletonLine, styles.skeletonText, animatedStyle]} />
      <Animated.View style={[styles.skeletonLine, styles.skeletonText, animatedStyle]} />
    </View>
  );
};

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 3, animated = true }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} animated={animated} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
  },
  skeletonText: {
    width: '100%',
  },
});
