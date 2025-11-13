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
      <AlertCircle
        size={48}
        color={theme.colors.textSecondary}
        strokeWidth={1.5}
      />
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
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
