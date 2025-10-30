import { apiClient } from "@/lib/api/api-client";
import { Truck } from "@/types";

export const truckService = {
  getTrucks: async (): Promise<Truck[]> => {
    return apiClient.get<Truck[]>("/trucks");
  },
};
