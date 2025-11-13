import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { theme } from "@/theme";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated";
}

export function Card({
  variant = "default",
  children,
  style,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  elevated: {
    ...theme.shadow.md,
    borderWidth: 0,
  },
});
