import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { api } from "@/lib/api";

export function useTrucksWithLocations() {
  return useQuery({
    queryKey: [QUERY_KEYS.TRUCKS_LOCATIONS],
    queryFn: api.getTrucksWithLocations,
    refetchInterval: 30_000, // 30 seconds - real-time updates
    staleTime: 15_000, // 15 seconds
  });
}
