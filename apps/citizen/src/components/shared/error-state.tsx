import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Clock, SearchX, ServerCrash, WifiOff } from 'lucide-react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-tokens';
import { AppError } from '@/lib/utils/error-handler';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
  isOffline?: boolean;
  isRetrying?: boolean;
  title?: string;
  message?: string;
}

interface ErrorInfo {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionable: boolean;
}

const getErrorInfo = (error: Error | null, isOffline: boolean): ErrorInfo => {
  // Offline state
  if (isOffline) {
    return {
      icon: <WifiOff size={48} color={Colors.textSecondary} />,
      title: 'Sin conexión',
      message: 'Verifica tu conexión a internet e intenta de nuevo.',
      actionable: true,
    };
  }

  // No error provided
  if (!error) {
    return {
      icon: <AlertCircle size={48} color={Colors.textSecondary} />,
      title: 'Algo salió mal',
      message: 'Ocurrió un error inesperado.',
      actionable: true,
    };
  }

  // AppError with specific status codes
  if (error instanceof AppError) {
    // Timeout errors
    if (error.statusCode === 408 || error.code === 'TIMEOUT') {
      return {
        icon: <Clock size={48} color={Colors.textSecondary} />,
        title: 'Tiempo agotado',
        message: 'La solicitud tardó demasiado. Intenta de nuevo.',
        actionable: true,
      };
    }

    // Server errors (5xx)
    if (error.statusCode >= 500) {
      return {
        icon: <ServerCrash size={48} color={Colors.textSecondary} />,
        title: 'Error del servidor',
        message: 'Estamos teniendo problemas. Intenta en unos minutos.',
        actionable: true,
      };
    }

    // Not found (404)
    if (error.statusCode === 404) {
      return {
        icon: <SearchX size={48} color={Colors.textSecondary} />,
        title: 'No encontrado',
        message: 'No pudimos encontrar lo que buscas.',
        actionable: false,
      };
    }

    // Network errors
    if (error.code === 'NETWORK_ERROR') {
      return {
        icon: <WifiOff size={48} color={Colors.textSecondary} />,
        title: 'Sin conexión',
        message: 'Verifica tu conexión a internet e intenta de nuevo.',
        actionable: true,
      };
    }
  }

  // Generic error
  return {
    icon: <AlertCircle size={48} color={Colors.textSecondary} />,
    title: 'Algo salió mal',
    message: error.message || 'Ocurrió un error inesperado.',
    actionable: true,
  };
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  isOffline = false,
  isRetrying = false,
  title: customTitle,
  message: customMessage,
}) => {
  const errorInfo = getErrorInfo(error, isOffline);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{errorInfo.icon}</View>
      
      <Text style={styles.title}>
        {customTitle || errorInfo.title}
      </Text>
      
      <Text style={styles.message}>
        {customMessage || errorInfo.message}
      </Text>

      {errorInfo.actionable && onRetry && (
        <Button
          title={isRetrying ? 'Reintentando...' : 'Reintentar'}
          onPress={onRetry}
          loading={isRetrying}
          variant="outline"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 140,
  },
});
