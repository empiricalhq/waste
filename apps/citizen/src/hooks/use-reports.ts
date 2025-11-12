import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { api } from "@/lib/api";
import type { Report } from "@/lib/schemas";

const PENDING_REPORTS_KEY = "pendingReports";

interface PendingReport {
  id: string;
  data: {
    type: string;
    description: string;
    location: string;
    imageUri?: string;
  };
  timestamp: number;
}

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
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof api.createReport>[0]) => {
      try {
        return await api.createReport(data);
      } catch (error) {
        // if network error, save to pending queue
        if ((error as any).code === "NETWORK_ERROR") {
          const pending: PendingReport = {
            id: `pending-${Date.now()}`,
            data,
            timestamp: Date.now(),
          };

          const existing = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
          const queue: PendingReport[] = existing ? JSON.parse(existing) : [];
          queue.push(pending);
          await AsyncStorage.setItem(
            PENDING_REPORTS_KEY,
            JSON.stringify(queue),
          );

          return {
            id: pending.id,
            type: data.type,
            description: data.description,
            status: "pending" as const,
          };
        }
        throw error;
      }
    },
    onSuccess: (report) => {
      queryClient.setQueryData<Report[]>([QUERY_KEYS.REPORTS], (old = []) => [
        report,
        ...old,
      ]);
    },
  });
}

// retry pending reports when online
export function useRetryPendingReports() {
  const queryClient = useQueryClient();

  return async () => {
    const pending = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
    if (!pending) {
      return;
    }

    const queue: PendingReport[] = JSON.parse(pending);
    const failed: PendingReport[] = [];

    for (const item of queue) {
      try {
        const report = await api.createReport(item.data);
        queryClient.setQueryData<Report[]>([QUERY_KEYS.REPORTS], (old = []) =>
          old.map((r) => (r.id === item.id ? report : r)),
        );
      } catch {
        failed.push(item);
      }
    }

    await AsyncStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(failed));
  };
}
