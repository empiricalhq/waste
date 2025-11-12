import { AlertCircle, WifiOff } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import { Button } from "./button";

interface ErrorMessageProps {
  message: string;
  isOffline?: boolean;
  onRetry?: () => void;
}

export function ErrorMessage({
  message,
  isOffline,
  onRetry,
}: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      {isOffline ? (
        <WifiOff size={48} color={theme.colors.textSecondary} />
      ) : (
        <AlertCircle size={48} color={theme.colors.textSecondary} />
      )}
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button title="Reintentar" onPress={onRetry} variant="secondary" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  message: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
