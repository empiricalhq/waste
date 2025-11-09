import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { mutationQueue } from '@/lib/offline/mutation-queue';
import { useNetworkStatus } from './use-network-status';

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
  }, [isOffline, handleConnectionRecovery, state.wasOffline]);

  const handleConnectionRecovery = async () => {
    try {
      setState((prev) => ({ ...prev, isRecovering: true }));

      // Retry queued mutations
      // Note: The actual mutation execution will be handled by individual mutation hooks
      // This is just a placeholder for now
      const queueCount = mutationQueue.getCount();
      if (queueCount > 0) {
      }

      // Refetch all stale queries
      await queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });

      setState((prev) => ({ ...prev, isRecovering: false }));
    } catch (_error) {
      setState((prev) => ({ ...prev, isRecovering: false }));
    }
  };

  return {
    isRecovering: state.isRecovering,
    isOnline: !isOffline,
  };
};
