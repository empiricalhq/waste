import {
  getCurrentPositionAsync,
  hasServicesEnabledAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useCallback, useState } from "react";
import { CONFIG, ERROR_MESSAGES } from "@/constants";
import type { LocationCoords } from "@/types";

interface UseLocationReturn {
  coords: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationCoords>;
  clearLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationCoords> => {
    setIsLoading(true);
    setError(null);

    try {
      const servicesEnabled = await hasServicesEnabledAsync();
      if (!servicesEnabled) {
        throw new Error(ERROR_MESSAGES.LOCATION_UNAVAILABLE);
      }

      const { status } = await requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(ERROR_MESSAGES.LOCATION_DENIED);
      }

      const locationPromise = getCurrentPositionAsync({
        accuracy: LocationAccuracy.Balanced,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(ERROR_MESSAGES.TIMEOUT)),
          CONFIG.location.timeout,
        ),
      );

      const location = await Promise.race([locationPromise, timeoutPromise]);

      const newCoords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoords(newCoords);
      setIsLoading(false);
      return newCoords;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : ERROR_MESSAGES.LOCATION_UNAVAILABLE;
      setError(errorMessage);
      setIsLoading(false);
      throw err;
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
