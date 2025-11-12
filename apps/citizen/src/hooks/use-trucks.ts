import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { api } from "@/lib/api";

export function useTrucks() {
  return useQuery({
    queryKey: [QUERY_KEYS.TRUCKS],
    queryFn: api.getTrucks,
    refetchInterval: 30_000, // 30 seconds
    staleTime: 60_000, // 1 minute
  });
}

export function useNearestTruck() {
  const { data: trucks = [], ...rest } = useTrucks();

  const nearestTruck =
    trucks.length > 0
      ? trucks.reduce((closest, truck) =>
          truck.eta < closest.eta ? truck : closest,
        )
      : null;

  return { nearestTruck, ...rest };
}
