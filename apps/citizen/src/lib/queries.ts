import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { POLLING } from "@/constants";
import { useAppState } from "@/hooks/use-app-state";
import { api } from "@/lib/api";
import type { CreateReportInput } from "@/types";

export function useTrucks() {
  const isActive = useAppState();

  return useQuery({
    queryKey: ["trucks"],
    queryFn: () => api.getTrucks(),
    refetchInterval: isActive ? POLLING.TRUCKS : false,
    staleTime: POLLING.TRUCKS,
  });
}

export function useTruckStatus() {
  const isActive = useAppState();

  return useQuery({
    queryKey: ["truck-status"],
    queryFn: () => api.getTruckStatus(),
    refetchInterval: isActive ? POLLING.STATUS : false,
    staleTime: POLLING.STATUS,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReportInput) => api.createReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
