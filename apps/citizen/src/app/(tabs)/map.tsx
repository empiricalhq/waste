import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useNetwork } from "@/hooks/use-network";
import { useTrucksWithLocations } from "@/hooks/use-trucks-locations";
import { theme } from "@/theme";

const DEFAULT_CAMERA_POSITION = {
  coordinates: {
    latitude: -12.0464,
    longitude: -77.0428,
  },
  zoom: 12,
};

const isSupportedPlatform = Platform.OS === "ios" || Platform.OS === "android";

export default function MapScreen() {
  const {
    data: trucks = [],
    isLoading,
    error,
    refetch,
  } = useTrucksWithLocations();
  const { isOffline } = useNetwork();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!isSupportedPlatform) {
      return;
    }

    (async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (err) {
        console.error("Error getting location:", err);
      }
    })();
  }, []);

  if (!isSupportedPlatform) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          Los mapas solo están disponibles en Android e iOS
        </Text>
      </View>
    );
  }

  const cameraPosition = userLocation
    ? {
        coordinates: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        zoom: 12,
      }
    : DEFAULT_CAMERA_POSITION;

  const markers = trucks.map((truck) => {
    const marker: {
      id: string;
      coordinates: { latitude: number; longitude: number };
      title: string;
      snippet?: string;
    } = {
      id: truck.id,
      coordinates: {
        latitude: truck.lat,
        longitude: truck.lng,
      },
      title: truck.name,
    };

    // Android supports snippet, iOS doesn't
    if (Platform.OS === "android") {
      marker.snippet = `Placa: ${truck.license_plate}`;
    }

    return marker;
  });

  if (isLoading && trucks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando camiones...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message={isOffline ? "Sin conexión" : "Error al cargar camiones"}
          isOffline={isOffline}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const MapComponent = Platform.OS === "ios" ? AppleMaps.View : GoogleMaps.View;

  return (
    <View style={styles.container}>
      <MapComponent
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
        properties={{
          isMyLocationEnabled: userLocation !== null,
        }}
        uiSettings={{
          myLocationButtonEnabled: true,
        }}
      />
      {!isLoading && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {trucks.length > 0
              ? `${trucks.length} camión${trucks.length !== 1 ? "es" : ""} activo${trucks.length !== 1 ? "s" : ""}`
              : "No hay camiones activos en este momento"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
  },
  infoContainer: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: "white",
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: theme.text.sm,
    color: theme.colors.text,
    fontWeight: "600",
  },
});
