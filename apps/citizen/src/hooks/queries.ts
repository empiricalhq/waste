import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CONFIG, QUERY_KEYS } from '@/constants';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import type { Report, PendingReport } from '@/types';

// Collections
export function useCollections() {
  return useQuery({
    queryKey: [QUERY_KEYS.COLLECTIONS],
    queryFn: api.getCollections,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useNextCollection() {
  return useQuery({
    queryKey: [QUERY_KEYS.COLLECTIONS, 'next'],
    queryFn: api.getNextCollection,
    staleTime: CONFIG.polling.collections,
  });
}

// Trucks
export function useTrucks() {
  return useQuery({
    queryKey: [QUERY_KEYS.TRUCKS],
    queryFn: api.getTruckStatus,
    refetchInterval: CONFIG.polling.trucks,
    staleTime: CONFIG.polling.trucks / 2,
  });
}

export function useTrucksWithLocations() {
  return useQuery({
    queryKey: [QUERY_KEYS.TRUCKS_LOCATIONS],
    queryFn: api.getTrucksWithLocations,
    refetchInterval: CONFIG.polling.trucks,
    staleTime: CONFIG.polling.trucks / 2,
  });
}

export function useNearestTruck() {
  const { data: trucks = [], ...rest } = useTrucks();
  
  const nearestTruck = trucks.length > 0
    ? trucks.reduce((closest, truck) => truck.eta < closest.eta ? truck : closest)
    : null;

  return { nearestTruck, ...rest };
}

// Reports
export function useReports() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS],
    queryFn: api.getReports,
  });
}

export function useReportTypes() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT_TYPES],
    queryFn: api.getReportTypes,
    staleTime: Infinity,
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof api.createReport>[0]) => {
      try {
        return await api.createReport(data);
      } catch (error: any) {
        if (error.code === 'NETWORK_ERROR') {
          const pending: PendingReport = {
            id: `pending-${Date.now()}`,
            data,
            timestamp: Date.now(),
          };

          await storage.addPendingReport(pending);

          return {
            id: pending.id,
            type: data.type,
            description: data.description,
            status: 'pending' as const,
          };
        }
        throw error;
      }
    },
    onSuccess: (report) => {
      queryClient.setQueryData<Report[]>(
        [QUERY_KEYS.REPORTS],
        (old = []) => [report, ...old]
      );
    },
  });
}

export function useRetryPendingReports() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const pending = await storage.getPendingReports();
    if (pending.length === 0) return;

    const results = await Promise.allSettled(
      pending.map(item => api.createReport(item.data))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const item = pending[i];

      if (result.status === 'fulfilled') {
        await storage.removePendingReport(item.id);
        queryClient.setQueryData<Report[]>(
          [QUERY_KEYS.REPORTS],
          (old = []) => old.map(r => r.id === item.id ? result.value : r)
        );
      }
    }
  }, [queryClient]);
}

// Quiz
export function useQuiz() {
  return useQuery({
    queryKey: [QUERY_KEYS.QUIZ],
    queryFn: api.getQuizQuestions,
    staleTime: Infinity,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateProgress,
    onSuccess: (user) => {
      queryClient.setQueryData([QUERY_KEYS.USER], user);
    },
  });
}
