import { apiClient } from '@/lib/api/api-client';
import type { Truck } from '@/types';

export const truckService = {
  getTrucks: async (): Promise<Truck[]> => {
    return apiClient.get<Truck[]>('/trucks');
  },
};
