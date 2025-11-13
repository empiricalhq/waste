import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { theme } from "../../theme";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
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
    </TouchableOpacity>
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
