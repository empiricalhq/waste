import { useQuery } from "@tanstack/react-query";
import { truckService } from "../services/truck-service";

export const useTrucks = () => {
  return useQuery({
    queryKey: ["trucks"],
    queryFn: truckService.getTrucks,
    refetchInterval: 30000, // Refresh truck locations every 30 seconds
  });
};
