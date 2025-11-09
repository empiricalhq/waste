import type React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { BorderRadius, Colors, Spacing } from '@/constants/design-tokens';

interface CardSkeletonProps {
  animated?: boolean;
}

interface ListSkeletonProps {
  count?: number;
  animated?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ animated = true }) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (animated) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.5, { duration: 800 })
        ),
        -1, // Infinite repeat
        false
      );
    }
  }, [animated, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animated ? opacity.value : 0.5,
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
