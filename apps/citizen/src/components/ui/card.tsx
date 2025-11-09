import type React from 'react';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ANIMATION_DURATIONS, EASING } from '@/constants/animations';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/design-tokens';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { hapticSelection } from '@/lib/utils/haptics';

type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (!reducedMotion && onPress) {
      scale.value = withTiming(0.98, {
        duration: ANIMATION_DURATIONS.QUICK,
        easing: EASING.OUT_QUAD,
      });
    }
  }, [reducedMotion, onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion && onPress) {
      scale.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.QUICK,
        easing: EASING.OUT_QUAD,
      });
    }
  }, [reducedMotion, onPress, scale]);

  const handlePress = useCallback(() => {
    if (onPress) {
      hapticSelection();
      onPress();
    }
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        <Animated.View style={[variantStyles, animatedStyle]}>{children}</Animated.View>
      </Pressable>
    );
  }

  return (
    <View
      style={variantStyles}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  elevated: {
    ...Shadows.md,
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    borderWidth: 0,
  },
});
