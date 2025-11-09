import { Alert } from 'react-native';
import { useConnectionType } from './use-connection-type';

/**
 * Format bytes to human-readable format
 */
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Hook to warn users about large downloads on cellular connections
 */
export const useDataUsageWarning = () => {
  const { isWifi } = useConnectionType();

  /**
   * Show a warning if downloading large data on cellular
   * @param dataSize Size in bytes
   * @param action Description of the action
   * @returns Promise that resolves to true if user confirms, false if cancelled
   */
  const warnIfCellular = (dataSize: number, action = 'esta acción'): Promise<boolean> => {
    // No warning needed on WiFi
    if (isWifi) {
      return Promise.resolve(true);
    }

    // Threshold: 5MB
    const threshold = 5 * 1024 * 1024;

    if (dataSize > threshold) {
      return new Promise((resolve) => {
        Alert.alert('Uso de datos', `${action} descargará aproximadamente ${formatBytes(dataSize)}. ¿Continuar?`, [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Continuar',
            onPress: () => resolve(true),
          },
        ]);
      });
    }

    return Promise.resolve(true);
  };

  return {
    warnIfCellular,
    isWifi,
  };
};
