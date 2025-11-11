import { useQuery } from "@tanstack/react-query";
import { truckService } from "../services/truck-service";

export const useTrucks = () => {
  return useQuery({
    queryKey: ["trucks"],
    queryFn: truckService.getTrucks,

    refetchInterval: 30_000, // Refresh truck locations every 30 seconds

    // Truck locations are time-sensitive but useful to show last known position
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes

    // Mark as available offline (shows last known positions)
    meta: {
      offlineAvailable: true,
      showLastUpdated: true, // Hint to UI to show timestamp
    },
  });
};
