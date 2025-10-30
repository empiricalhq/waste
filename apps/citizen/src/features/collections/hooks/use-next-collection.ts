import { useMemo } from "react";
import { useCollections } from "./use-collections";

export const useNextCollection = () => {
  const { data: collections = [], ...queryInfo } = useCollections();

  const nextCollection = useMemo(() => {
    return collections
      .filter((c) => !c.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [collections]);

  return { nextCollection, ...queryInfo };
};
