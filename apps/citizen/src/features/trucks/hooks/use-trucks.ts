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
  });
}
