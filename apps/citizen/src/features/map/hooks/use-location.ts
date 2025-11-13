import {
  getCurrentPositionAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useCallback, useEffect, useState } from "react";
import type { LocationCoords } from "@/types";

interface UseLocationOptions {
  // if true, location will be requested immediately upon component mount
  fetchOnMount?: boolean;
}

export function useLocation(options: UseLocationOptions = {}) {
  const { fetchOnMount = false } = options;

  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(fetchOnMount);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationCoords> => {
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo obtener la ubicación";
      setError(message);
      setCoords(null);
      // Re-throw the error so the calling component can handle it if needed
      // (e.g., in a try/catch block for an imperative call).
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchOnMount) {
      requestLocation().catch((err) => {
        // The error state is already set within requestLocation.
        // This log ensures the error is not silently swallowed during development.
        console.error("Failed to fetch location on mount:", err);
      });
    }
  }, [fetchOnMount, requestLocation]);

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
