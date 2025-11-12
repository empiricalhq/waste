import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { api } from "@/lib/api";

export function useCollections() {
  return useQuery({
    queryKey: [QUERY_KEYS.COLLECTIONS],
    queryFn: api.getCollections,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useNextCollection() {
  const { data: collections = [], ...rest } = useCollections();

  const nextCollection = collections
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return { nextCollection, ...rest };
}
