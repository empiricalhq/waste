import { apiClient } from "@/lib/api/api-client";
import { Collection } from "@/types";

export const collectionService = {
  getCollections: async (): Promise<Collection[]> => {
    return apiClient.get<Collection[]>("/collections");
  },
};
