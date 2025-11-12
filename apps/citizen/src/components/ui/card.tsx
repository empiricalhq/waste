import { memo } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { theme } from "@/theme";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated";
}

export const Card = memo<CardProps>(
  ({ style, variant = "default", ...props }) => {
    return (
      <View
        style={[styles.card, variant === "elevated" && styles.elevated, style]}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

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
