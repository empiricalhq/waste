import { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";

interface LoadingProps {
  message?: string;
  size?: "small" | "large";
}

export const Loading = memo<LoadingProps>(({ message, size = "large" }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
});

Loading.displayName = "Loading";

// Skeleton loading for lists
export const SkeletonCard = memo(() => (
  <View style={styles.skeleton}>
    <View style={styles.skeletonLine} />
    <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
  </View>
));

SkeletonCard.displayName = "SkeletonCard";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  message: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  skeleton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  skeletonLineShort: {
    width: "60%",
  },
});
