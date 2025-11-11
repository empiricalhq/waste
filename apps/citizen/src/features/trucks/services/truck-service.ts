import { apiClient } from "@/lib/api/api-client";
import type { Truck } from "@/types";

export const truckService = {
  /**
   * Fetches the list of all active trucks.
   * This is a public endpoint accessible to guest users.
   */
  getTrucks: async (): Promise<Truck[]> => {
    return apiClient.get<Truck[]>("/trucks");
  },
};
