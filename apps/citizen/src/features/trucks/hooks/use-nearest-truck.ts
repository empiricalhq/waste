import { useMemo } from "react";
import { useTrucks } from "./use-trucks";

export const useNearestTruck = () => {
  const { data: trucks = [], ...queryInfo } = useTrucks();

  const nearestTruck = useMemo(() => {
    if (trucks.length === 0) return null;
    return trucks.reduce((closest, truck) => (truck.eta < closest.eta ? truck : closest));
  }, [trucks]);

  return { nearestTruck, ...queryInfo };
};
