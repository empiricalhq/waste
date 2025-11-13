import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { POLLING } from "@/constants";
import { api } from "@/lib/api";

/**
 * Hook to fetch truck status with smart polling
 */
export function useTruckStatus(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [isComponentMounted, setIsComponentMounted] = useState(true);

  useEffect(() => {
    setIsComponentMounted(true);
    return () => {
      setIsComponentMounted(false);
    };
  }, []);

  return useQuery({
    queryKey: ["truck-status"],
    queryFn: () => api.getTruckStatus(),
    refetchInterval: isComponentMounted && enabled ? POLLING.STATUS : false,
    staleTime: POLLING.STATUS,
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30_000),
  });
}
