import {
  getCurrentPositionAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useCallback, useState } from "react";
import type { LocationCoords } from "@/types";

export function useLocation() {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Permiso de ubicación denegado");
      }

      const location = await getCurrentPositionAsync({
        accuracy: LocationAccuracy.Balanced,
      });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoords(newCoords);
      return newCoords;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo obtener la ubicación";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setError(null);
  }, []);

  return {
    coords,
    isLoading,
    error,
    requestLocation,
    clearLocation,
  };
}
