import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

type ConnectionType = 'wifi' | 'cellular' | 'none';

interface ConnectionTypeState {
  connectionType: ConnectionType;
  isWifi: boolean;
  isCellular: boolean;
  isConnected: boolean;
}

export const useConnectionType = (): ConnectionTypeState => {
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);

      if (!state.isConnected) {
        setConnectionType('none');
      } else if (state.type === 'wifi') {
        setConnectionType('wifi');
      } else if (state.type === 'cellular') {
        setConnectionType('cellular');
      } else {
        // Other connection types (ethernet, bluetooth, etc.) treated as wifi
        setConnectionType('wifi');
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    connectionType,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
    isConnected,
  };
};
