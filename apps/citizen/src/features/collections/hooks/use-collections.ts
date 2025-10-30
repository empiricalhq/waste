import { useQuery } from "@tanstack/react-query";
import { collectionService } from "../services/collection-service";

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: collectionService.getCollections,
  });
};
