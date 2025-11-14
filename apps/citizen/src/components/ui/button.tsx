import {
  ActivityIndicator,
  type GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { theme } from "@/theme";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, theme.animation.easing.spring);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, theme.animation.easing.spring);
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" ? theme.colors.textInverse : theme.colors.text
          }
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.sm,
  },
  secondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  sm: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    height: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    height: 52,
    paddingHorizontal: theme.spacing.xl,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  primaryText: {
    color: theme.colors.textInverse,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  ghostText: {
    color: theme.colors.text,
  },
});
