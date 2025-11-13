import {
  getCurrentPositionAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { TruckMap } from "@/components/truck-map";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { useTrucks } from "@/lib/queries";
import { theme } from "@/theme";
import type { LocationCoords } from "@/types";

export default function MapScreen() {
  const { data: trucks = [], isLoading, error, refetch } = useTrucks();
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }

    (async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await getCurrentPositionAsync({
            accuracy: LocationAccuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (err) {
        console.error("Location error:", err);
      }
    })();
  }, []);

  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Los mapas solo están disponibles en iOS y Android
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Loading message="Cargando camiones..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorState message="Error al cargar camiones" onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TruckMap trucks={trucks} userLocation={userLocation} />
      {trucks.length > 0 && (
        <View style={[styles.badge, theme.shadow.md]}>
          <Text style={styles.badgeText}>
            {trucks.length} camión{trucks.length !== 1 ? "es" : ""} activo
            {trucks.length !== 1 ? "s" : ""}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xxl,
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  badgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
