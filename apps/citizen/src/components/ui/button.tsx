import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/design-tokens";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const containerStyle: ViewStyle[] = [
    styles.container,
    variant === "primary" ? styles.primaryContainer : styles.secondaryContainer,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    variant === "primary" ? styles.primaryText : styles.secondaryText,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.textInverse : Colors.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryContainer: {
    backgroundColor: Colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondaryText: {
    color: Colors.text,
  },
  disabled: {
    opacity: 0.6,
  },
});
