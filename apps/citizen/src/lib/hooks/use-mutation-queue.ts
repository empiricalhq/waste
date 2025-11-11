import { useEffect, useState } from "react";
import {
  mutationQueue,
  type QueuedMutation,
} from "@/lib/offline/mutation-queue";

interface MutationQueueState {
  count: number;
  mutations: QueuedMutation[];
}

export const useMutationQueue = () => {
  const [state, setState] = useState<MutationQueueState>({
    count: 0,
    mutations: [],
  });

  const updateState = () => {
    setState({
      count: mutationQueue.getCount(),
      mutations: mutationQueue.getQueue(),
    });
  };

  // Hydrate queue on mount
  useEffect(() => {
    const loadQueue = async () => {
      await mutationQueue.hydrate();
      updateState();
    };

    loadQueue();
  }, [updateState]);

  const retryAll = async (
    mutationFn: (mutation: QueuedMutation) => Promise<void>,
  ) => {
    await mutationQueue.retryAll(mutationFn);
    updateState();
  };

  const clear = async () => {
    await mutationQueue.clear();
    updateState();
  };

  return {
    count: state.count,
    mutations: state.mutations,
    retryAll,
    clear,
    refresh: updateState,
  };
};
