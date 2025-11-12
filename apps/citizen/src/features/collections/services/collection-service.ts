import { apiClient } from "@/lib/api/api-client";
import type { Collection } from "@/types";

export const collectionService = {
  /**
   * Fetches the list of all collections.
   * This is a public endpoint accessible to guest users.
   */
  getCollections: (): Promise<Collection[]> => {
    return apiClient.get<Collection[]>("/collections");
  },
};
