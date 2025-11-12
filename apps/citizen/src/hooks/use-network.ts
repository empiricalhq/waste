// hooks/use-network.ts
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState, useCallback } from 'react';

interface NetworkStatus {
  isOffline: boolean;
  isWifi: boolean;
  isConnected: boolean;
}

export function useNetwork(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOffline: false,
    isWifi: true,
    isConnected: true,
  });

  const handleConnectivityChange = useCallback((state: NetInfoState) => {
    setStatus({
      isOffline: !state.isConnected,
      isWifi: state.type === 'wifi',
      isConnected: state.isConnected ?? false,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return unsubscribe;
  }, [handleConnectivityChange]);

  return status;
}
