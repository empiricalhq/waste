import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { POLLING } from "@/constants";
import { api } from "@/lib/api";

/**
 * Hook to fetch trucks with smart polling that only runs when component is mounted
 */
export function useTrucks(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [isComponentMounted, setIsComponentMounted] = useState(true);

  // Track when component using this hook unmounts
  useEffect(() => {
    setIsComponentMounted(true);
    return () => {
      setIsComponentMounted(false);
    };
  }, []);

  return useQuery({
    queryKey: ["trucks"],
    queryFn: () => api.getTrucks(),
    // Only poll when:
    // 1. Component is mounted
    // 2. Hook is explicitly enabled
    refetchInterval: isComponentMounted && enabled ? POLLING.TRUCKS : false,
    staleTime: POLLING.TRUCKS,
    // Keep previous data while refetching for smooth UX
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
  });
}
