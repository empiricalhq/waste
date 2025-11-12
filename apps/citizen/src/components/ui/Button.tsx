import { memo } from "react";
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";
import { theme } from "@/theme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export const Button = memo<ButtonProps>(
  ({
    title,
    loading = false,
    variant = "primary",
    size = "medium",
    fullWidth = false,
    style,
    disabled,
    ...props
  }) => {
    const isDisabled = disabled || loading;

    const buttonStyle: StyleProp<ViewStyle> = [
      styles.base,
      styles[variant as keyof typeof styles] as ViewStyle,
      styles[size as keyof typeof styles] as ViewStyle,
      fullWidth ? styles.fullWidth : undefined,
      isDisabled ? styles.disabled : undefined,
    ];

    const textStyle: StyleProp<TextStyle> = [
      styles.text,
      styles[`${variant}Text` as keyof typeof styles] as TextStyle,
      styles[`${size}Text` as keyof typeof styles] as TextStyle,
      isDisabled ? styles.disabledText : undefined,
    ];

    return (
      <TouchableOpacity
        style={[buttonStyle, style]}
        disabled={isDisabled}
        activeOpacity={0.7}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size={size === "small" ? "small" : "small"}
            color={
              variant === "primary"
                ? theme.colors.textInverse
                : theme.colors.primary
            }
          />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  small: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    height: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
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
    fontWeight: theme.fontWeight.semibold,
  },
  primaryText: {
    color: theme.colors.textInverse,
    fontSize: theme.text.base,
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: theme.text.base,
  },
  ghostText: {
    color: theme.colors.primary,
    fontSize: theme.text.base,
  },
  smallText: {
    fontSize: theme.text.sm,
  },
  mediumText: {
    fontSize: theme.text.base,
  },
  largeText: {
    fontSize: theme.text.lg,
  },
  disabledText: {
    opacity: 0.7,
  },
});
