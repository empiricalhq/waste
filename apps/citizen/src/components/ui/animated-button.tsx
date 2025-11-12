import type React from "react";
import { useState } from "react";
import type { GestureResponderEvent } from "react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ANIMATION_DURATIONS, EASING } from "@/constants/animations";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { hapticSelection } from "@/lib/utils/haptics";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  style,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  const [_isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);

  const containerStyle = [
    styles.container,
    styles[`${size}Container`],
    styles[`${variant}Container`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
  ];

  const getLoaderColor = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return Colors.textInverse;
      case "ghost":
        return Colors.primary;
      default:
        return Colors.text;
    }
  };

  const handlePressIn = () => {
    if (!(disabled || loading)) {
      setIsPressed(true);
      if (!reducedMotion) {
        scale.value = withTiming(0.95, {
          duration: ANIMATION_DURATIONS.QUICK,
          easing: EASING.OUT_QUAD,
        });
      }
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (!reducedMotion) {
      scale.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.QUICK,
        easing: EASING.OUT_QUAD,
      });
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    hapticSelection();
    onPress?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[containerStyle, animatedStyle]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  smContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  mdContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  lgContainer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  primaryContainer: {
    backgroundColor: Colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },
  dangerContainer: {
    backgroundColor: Colors.error,
  },
  text: {
    fontWeight: Typography.fontWeight.medium,
  },
  smText: {
    fontSize: Typography.fontSize.sm,
  },
  mdText: {
    fontSize: Typography.fontSize.base,
  },
  lgText: {
    fontSize: Typography.fontSize.lg,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondaryText: {
    color: Colors.text,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
  dangerText: {
    color: Colors.textInverse,
  },
  disabled: {
    opacity: 0.6,
  },
});

export { AnimatedButton };
