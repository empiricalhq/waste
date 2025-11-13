import { useQuery } from "@tanstack/react-query";
import { POLLING } from "@/constants";
import { useAppState } from "@/hooks/use-app-state";
import { api } from "@/lib/api";

export function useTruckStatus() {
  const isActive = useAppState();

  return useQuery({
    queryKey: ["truck-status"],
    queryFn: () => api.getTruckStatus(),
    refetchInterval: isActive ? POLLING.STATUS : false,
    staleTime: POLLING.STATUS,
  });
}
