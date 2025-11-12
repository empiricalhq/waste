import { AlertCircle, WifiOff } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  isOffline?: boolean;
  onRetry?: () => void;
}

export const ErrorMessage = memo<ErrorMessageProps>(({
  message,
  isOffline = false,
  onRetry,
}) => {
  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {isOffline ? (
          <WifiOff size={48} color={theme.colors.textSecondary} strokeWidth={1.5} />
        ) : (
          <AlertCircle size={48} color={theme.colors.error} strokeWidth={1.5} />
        )}
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Reintentar"
          onPress={handleRetry}
          variant="secondary"
          size="medium"
        />
      )}
    </View>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
