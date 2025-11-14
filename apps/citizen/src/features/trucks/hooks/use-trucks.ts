import { useQuery } from "@tanstack/react-query";
import { POLLING } from "@/constants";
import { useAppState } from "@/hooks/use-app-state";
import { api } from "@/lib/api";

/**
 * Hook to fetch trucks with smart polling that only runs when app is active
 */
export function useTrucks(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const isAppActive = useAppState();

  return useQuery({
    queryKey: ["trucks"],
    queryFn: () => api.getTrucks(),
    // Only poll when:
    // 1. App is in the foreground
    // 2. Hook is explicitly enabled
    refetchInterval: isAppActive && enabled ? POLLING.TRUCKS : false,
    staleTime: POLLING.TRUCKS,
    // Keep previous data while refetching for smooth UX
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
  });
}
