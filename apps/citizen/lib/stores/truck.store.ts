import { create } from 'zustand';
import { getTruckStatusForUser } from '@/lib/api/truck.api';
import type { TruckState } from '@/lib/types/truck.types';

export const useTruckStore = create<TruckState>((set) => ({
  status: 'LOADING',
  etaMinutes: null,
  nextCollectionDay: null,
  error: null,

  fetchTruckStatus: async (userId: string) => {
    set({ status: 'LOADING', error: null });

    try {
      const result = await getTruckStatusForUser(userId);

      if (result.status === 'NEARBY' || result.status === 'ON_THE_WAY') {
        set({
          status: result.status,
          etaMinutes: result.etaMinutes,
          nextCollectionDay: null,
        });
      } else {
        set({
          status: 'NOT_SCHEDULED',
          etaMinutes: null,
          nextCollectionDay: result.nextCollectionDay,
        });
      }
    } catch (error: any) {
      set({
        status: 'ERROR',
        error: error.message || 'Failed to fetch truck status.',
      });
    }
  },
}));
