import { useQuery } from "@tanstack/react-query";
import { collectionService } from "../services/collection-service";

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: collectionService.getCollections,
    // collection schedules are relatively stable, cache for 24 hours
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    // mark as available offline
    meta: {
      offlineAvailable: true,
    },
  });
};
