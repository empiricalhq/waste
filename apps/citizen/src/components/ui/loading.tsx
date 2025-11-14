import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";

interface LoadingProps {
  message?: string;
  size?: "small" | "large";
}

export function Loading({ message, size = "large" }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  message: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
});
