import { AlertCircle, Clock, RefreshCw, SearchX, ServerCrash, ShieldAlert, WifiOff } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { AppError } from '@/lib/utils/error-handler';
import { logError } from '@/lib/utils/error-logger';

export type ErrorType = 
  | 'network'
  | 'timeout'
  | 'server'
  | 'not-found'
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'unknown';

interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
  isOffline?: boolean;
  isRetrying?: boolean;
  title?: string;
  message?: string;
  errorType?: ErrorType;
  showRetry?: boolean;
  retryLimit?: number;
  variant?: 'full' | 'compact';
}

interface ErrorInfo {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionable: boolean;
  type: ErrorType;
}

const getErrorInfo = (error: Error | null, isOffline: boolean, errorType?: ErrorType): ErrorInfo => {
  // Offline state
  if (isOffline) {
    return {
      icon: <WifiOff size={48} color={Colors.textSecondary} />,
      title: 'Sin conexión',
      message: 'Verifica tu conexión a internet e intenta de nuevo.',
      actionable: true,
      type: 'network',
    };
  }

  // No error provided
  if (!error) {
    return {
      icon: <AlertCircle size={48} color={Colors.textSecondary} />,
      title: 'Algo salió mal',
      message: 'Ocurrió un error inesperado.',
      actionable: true,
      type: 'unknown',
    };
  }

  // Use explicit error type if provided
  if (errorType) {
    return getErrorInfoByType(errorType, error.message);
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
        type: 'timeout',
      };
    }

    // Server errors (5xx)
    if (error.statusCode >= 500) {
      return {
        icon: <ServerCrash size={48} color={Colors.textSecondary} />,
        title: 'Error del servidor',
        message: 'Estamos teniendo problemas. Intenta en unos minutos.',
        actionable: true,
        type: 'server',
      };
    }

    // Unauthorized (401)
    if (error.statusCode === 401) {
      return {
        icon: <ShieldAlert size={48} color={Colors.textSecondary} />,
        title: 'No autorizado',
        message: 'Tu sesión expiró. Por favor, inicia sesión de nuevo.',
        actionable: false,
        type: 'unauthorized',
      };
    }

    // Forbidden (403)
    if (error.statusCode === 403) {
      return {
        icon: <ShieldAlert size={48} color={Colors.textSecondary} />,
        title: 'Acceso denegado',
        message: 'No tienes permiso para acceder a este recurso.',
        actionable: false,
        type: 'forbidden',
      };
    }

    // Not found (404)
    if (error.statusCode === 404) {
      return {
        icon: <SearchX size={48} color={Colors.textSecondary} />,
        title: 'No encontrado',
        message: 'No pudimos encontrar lo que buscas.',
        actionable: false,
        type: 'not-found',
      };
    }

    // Validation errors (400)
    if (error.statusCode === 400) {
      return {
        icon: <AlertCircle size={48} color={Colors.textSecondary} />,
        title: 'Datos inválidos',
        message: error.message || 'Por favor, verifica los datos e intenta de nuevo.',
        actionable: false,
        type: 'validation',
      };
    }

    // Network errors
    if (error.code === 'NETWORK_ERROR') {
      return {
        icon: <WifiOff size={48} color={Colors.textSecondary} />,
        title: 'Sin conexión',
        message: 'Verifica tu conexión a internet e intenta de nuevo.',
        actionable: true,
        type: 'network',
      };
    }
  }

  // Generic error
  return {
    icon: <AlertCircle size={48} color={Colors.textSecondary} />,
    title: 'Algo salió mal',
    message: error.message || 'Ocurrió un error inesperado.',
    actionable: true,
    type: 'unknown',
  };
};

const getErrorInfoByType = (type: ErrorType, message?: string): ErrorInfo => {
  switch (type) {
    case 'network':
      return {
        icon: <WifiOff size={48} color={Colors.textSecondary} />,
        title: 'Sin conexión',
        message: message || 'Verifica tu conexión a internet e intenta de nuevo.',
        actionable: true,
        type: 'network',
      };
    case 'timeout':
      return {
        icon: <Clock size={48} color={Colors.textSecondary} />,
        title: 'Tiempo agotado',
        message: message || 'La solicitud tardó demasiado. Intenta de nuevo.',
        actionable: true,
        type: 'timeout',
      };
    case 'server':
      return {
        icon: <ServerCrash size={48} color={Colors.textSecondary} />,
        title: 'Error del servidor',
        message: message || 'Estamos teniendo problemas. Intenta en unos minutos.',
        actionable: true,
        type: 'server',
      };
    case 'not-found':
      return {
        icon: <SearchX size={48} color={Colors.textSecondary} />,
        title: 'No encontrado',
        message: message || 'No pudimos encontrar lo que buscas.',
        actionable: false,
        type: 'not-found',
      };
    case 'unauthorized':
      return {
        icon: <ShieldAlert size={48} color={Colors.textSecondary} />,
        title: 'No autorizado',
        message: message || 'Tu sesión expiró. Por favor, inicia sesión de nuevo.',
        actionable: false,
        type: 'unauthorized',
      };
    case 'forbidden':
      return {
        icon: <ShieldAlert size={48} color={Colors.textSecondary} />,
        title: 'Acceso denegado',
        message: message || 'No tienes permiso para acceder a este recurso.',
        actionable: false,
        type: 'forbidden',
      };
    case 'validation':
      return {
        icon: <AlertCircle size={48} color={Colors.textSecondary} />,
        title: 'Datos inválidos',
        message: message || 'Por favor, verifica los datos e intenta de nuevo.',
        actionable: false,
        type: 'validation',
      };
    default:
      return {
        icon: <AlertCircle size={48} color={Colors.textSecondary} />,
        title: 'Algo salió mal',
        message: message || 'Ocurrió un error inesperado.',
        actionable: true,
        type: 'unknown',
      };
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  isOffline = false,
  isRetrying = false,
  title: customTitle,
  message: customMessage,
  errorType,
  showRetry = true,
  retryLimit = 3,
  variant = 'full',
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isLocalRetrying, setIsLocalRetrying] = useState(false);

  const errorInfo = getErrorInfo(error, isOffline, errorType);

  // Log error for tracking
  if (error && !isOffline) {
    logError(error, {
      errorType: errorInfo.type,
      retryCount,
    });
  }

  const handleRetry = useCallback(async () => {
    if (!onRetry || retryCount >= retryLimit) {
      return;
    }

    setIsLocalRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      await onRetry();
    } finally {
      setIsLocalRetrying(false);
    }
  }, [onRetry, retryCount, retryLimit]);

  const canRetry = errorInfo.actionable && onRetry && showRetry && retryCount < retryLimit;
  const retrying = isRetrying || isLocalRetrying;

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactContent}>
          <View style={styles.compactIconContainer}>{errorInfo.icon}</View>
          <View style={styles.compactTextContainer}>
            <Text style={styles.compactTitle}>{customTitle || errorInfo.title}</Text>
            <Text style={styles.compactMessage}>{customMessage || errorInfo.message}</Text>
          </View>
        </View>
        {canRetry && (
          <Button
            title={retrying ? 'Reintentando...' : 'Reintentar'}
            onPress={handleRetry}
            loading={retrying}
            variant="outline"
            style={styles.compactRetryButton}
            icon={<RefreshCw size={16} color={Colors.primary} />}
          />
        )}
        {retryCount >= retryLimit && (
          <Text style={styles.compactRetryLimitText}>
            Límite de reintentos alcanzado. Por favor, intenta más tarde.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{errorInfo.icon}</View>

      <Text style={styles.title}>{customTitle || errorInfo.title}</Text>

      <Text style={styles.message}>{customMessage || errorInfo.message}</Text>

      {canRetry && (
        <View style={styles.retryContainer}>
          <Button
            title={retrying ? 'Reintentando...' : 'Reintentar'}
            onPress={handleRetry}
            loading={retrying}
            variant="outline"
            style={styles.retryButton}
            icon={<RefreshCw size={18} color={Colors.primary} />}
          />
          {retryCount > 0 && retryCount < retryLimit && (
            <Text style={styles.retryCount}>
              Intento {retryCount} de {retryLimit}
            </Text>
          )}
          {retryCount >= retryLimit && (
            <Text style={styles.retryLimitText}>
              Límite de reintentos alcanzado. Por favor, intenta más tarde.
            </Text>
          )}
        </View>
      )}

      {__DEV__ && error && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Debug: {error.name} - {error.message}
          </Text>
        </View>
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
  retryContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  retryButton: {
    minWidth: 140,
  },
  retryCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  retryLimitText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  debugInfo: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    maxWidth: '100%',
  },
  debugText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  compactContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  compactIconContainer: {
    marginRight: Spacing.md,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  compactMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  compactRetryButton: {
    alignSelf: 'flex-start',
  },
  compactRetryLimitText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Spacing.sm,
  },
});
