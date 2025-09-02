import { create } from 'zustand';
import { getTruckStatusForUser } from '@/services/api';

export type TruckStatus = 'NEARBY' | 'ON_THE_WAY' | 'NOT_SCHEDULED' | 'LOADING' | 'ERROR';

type TruckState = {
  status: TruckStatus;
  etaMinutes: number | null;
  nextCollectionDay: string | null;
  error: string | null;
  fetchTruckStatus: (userId: string) => Promise<void>;
};

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
      } else if (result.status === 'NOT_SCHEDULED') {
        set({
          status: 'NOT_SCHEDULED',
          etaMinutes: null,
          nextCollectionDay: result.nextCollectionDay,
        });
      }
    } catch (e: any) {
      set({ status: 'ERROR', error: e.message || 'Failed to fetch truck status.' });
    }
  },
}));
