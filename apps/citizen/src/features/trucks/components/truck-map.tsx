import { AppleMaps, GoogleMaps } from "expo-maps";
import { memo, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { DEFAULT_MAP_CENTER } from "@/constants";
import { theme } from "@/theme";
import type { LocationCoords, Truck } from "@/types";

interface TruckMapProps {
  trucks: Truck[];
  userLocation?: LocationCoords | null;
}

function TruckMapComponent({ trucks, userLocation }: TruckMapProps) {
  const MapComponent = Platform.OS === "ios" ? AppleMaps.View : GoogleMaps.View;

  // Only update camera when user location coordinates actually change
  const camera = useMemo(() => {
    if (userLocation) {
      return {
        coordinates: userLocation,
        zoom: 13,
      };
    }
    return DEFAULT_MAP_CENTER;
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Memoize markers array, only recreate when truck IDs or positions change
  const markers = useMemo(() => {
    return trucks.map((truck) => ({
      key: truck.id,
      coordinates: { latitude: truck.lat, longitude: truck.lng },
      title: truck.name,
      snippet: `Placa: ${truck.licensePlate}`,
    }));
  }, [trucks]);

  // Create a stable key from truck positions to prevent unnecessary re-renders
  const trucksKey = useMemo(
    () => trucks.map((t) => `${t.id}-${t.lat}-${t.lng}`).join(","),
    [trucks],
  );

  return (
    <View style={styles.container}>
      <MapComponent
        key={trucksKey}
        style={styles.map}
        cameraPosition={camera}
        {...(Platform.OS === "ios" ? { annotations: markers } : { markers })}
        properties={{ isMyLocationEnabled: Boolean(userLocation) }}
        uiSettings={{ myLocationButtonEnabled: Boolean(userLocation) }}
      />
    </View>
  );
}

// Memo component to prevent re-renders when props haven't changed
export const TruckMap = memo(TruckMapComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  const sameUserLocation =
    prevProps.userLocation?.latitude === nextProps.userLocation?.latitude &&
    prevProps.userLocation?.longitude === nextProps.userLocation?.longitude;

  // Check if truck data actually changed
  const sameTrucks =
    prevProps.trucks.length === nextProps.trucks.length &&
    prevProps.trucks.every((truck, index) => {
      const nextTruck = nextProps.trucks[index];
      return (
        truck.id === nextTruck.id &&
        truck.lat === nextTruck.lat &&
        truck.lng === nextTruck.lng
      );
    });

  return sameUserLocation && sameTrucks;
});

TruckMap.displayName = "TruckMap";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
});
