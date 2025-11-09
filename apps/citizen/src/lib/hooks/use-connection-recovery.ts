import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from './use-network-status';
import { mutationQueue } from '@/lib/offline/mutation-queue';

interface ConnectionRecoveryState {
  isRecovering: boolean;
  wasOffline: boolean;
}

export const useConnectionRecovery = () => {
  const [state, setState] = useState<ConnectionRecoveryState>({
    isRecovering: false,
    wasOffline: false,
  });
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Detect connection recovery
    if (state.wasOffline && !isOffline) {
      handleConnectionRecovery();
    }

    // Update wasOffline state
    setState((prev) => ({ ...prev, wasOffline: isOffline }));
  }, [isOffline]);

  const handleConnectionRecovery = async () => {
    try {
      setState((prev) => ({ ...prev, isRecovering: true }));

      console.log('Connection restored, refetching queries');

      // Show brief notification
      // Note: In a real app, you'd use a toast library here
      // For now, we'll just log it
      console.log('Conexión restaurada');

      // Retry queued mutations
      // Note: The actual mutation execution will be handled by individual mutation hooks
      // This is just a placeholder for now
      const queueCount = mutationQueue.getCount();
      if (queueCount > 0) {
        console.log(`${queueCount} mutations queued for retry`);
      }

      // Refetch all stale queries
      await queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });

      setState((prev) => ({ ...prev, isRecovering: false }));
    } catch (error) {
      console.error('Error during connection recovery:', error);
      setState((prev) => ({ ...prev, isRecovering: false }));
    }
  };

  return {
    isRecovering: state.isRecovering,
    isOnline: !isOffline,
  };
};
