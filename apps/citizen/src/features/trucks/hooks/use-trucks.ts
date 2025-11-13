import { useQuery } from "@tanstack/react-query";
import { POLLING } from "@/constants";
import { useAppState } from "@/hooks/use-app-state";
import { api } from "@/lib/api";

export function useTrucks() {
  const isActive = useAppState();

  return useQuery({
    queryKey: ["trucks"],
    queryFn: () => api.getTrucks(),
    refetchInterval: isActive ? POLLING.TRUCKS : false,
    staleTime: POLLING.TRUCKS,
    retry: 3,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30_000), // 2s, 4s, 8s, ... up to 30s
  });
}
