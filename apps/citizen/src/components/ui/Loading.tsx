import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";

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

export function SkeletonCard() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.line} />
      <View style={[styles.line, styles.lineShort]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  skeleton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  line: {
    height: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  lineShort: {
    width: "60%",
  },
});
