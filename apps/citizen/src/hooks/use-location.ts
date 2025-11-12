import * as Location from "expo-location";
import { useState } from "react";

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  coords: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    isLoading: false,
    error: null,
  });

  const requestLocation = async (): Promise<LocationCoords> => {
    setState({ coords: null, isLoading: true, error: null });

    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        throw new Error(
          "Los servicios de ubicación están desactivados. Por favor, actívalos en la configuración de tu dispositivo.",
        );
      }

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(
          "Se necesita permiso para acceder a la ubicación. Por favor, permite el acceso en la configuración de la aplicación.",
        );
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setState({ coords, isLoading: false, error: null });
      return coords;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al obtener la ubicación. Por favor, intenta nuevamente.";
      setState({ coords: null, isLoading: false, error: errorMessage });
      throw error;
    }
  };

  const clearLocation = () => {
    setState({ coords: null, isLoading: false, error: null });
  };

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
}

