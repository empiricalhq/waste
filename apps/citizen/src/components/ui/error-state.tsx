import { AlertCircle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import { Button } from "./button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, theme.shadow.sm]}>
        <AlertCircle size={32} color={theme.colors.error} strokeWidth={2} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button title="Reintentar" onPress={onRetry} variant="secondary" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
