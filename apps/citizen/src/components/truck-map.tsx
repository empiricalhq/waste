import { AppleMaps, GoogleMaps } from "expo-maps";
import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { DEFAULT_MAP_CENTER } from "@/constants";
import { theme } from "@/theme";
import type { LocationCoords, Truck } from "@/types";

interface TruckMapProps {
  trucks: Truck[];
  userLocation?: LocationCoords | null;
}

export function TruckMap({ trucks, userLocation }: TruckMapProps) {
  const MapComponent = Platform.OS === "ios" ? AppleMaps.View : GoogleMaps.View;

  const camera = useMemo(
    () =>
      userLocation
        ? { coordinates: userLocation, zoom: 13 }
        : DEFAULT_MAP_CENTER,
    [userLocation]
  );

  const markers = useMemo(
    () =>
      trucks.map((truck) => ({
        id: truck.id,
        coordinates: { latitude: truck.lat, longitude: truck.lng },
        title: truck.name,
        ...(Platform.OS === "android" && {
          snippet: `Placa: ${truck.licensePlate}`,
        }),
      })),
    [trucks]
  );

  return (
    <View style={styles.container}>
      <MapComponent
        style={styles.map}
        cameraPosition={camera}
        markers={markers}
        properties={{ isMyLocationEnabled: Boolean(userLocation) }}
        uiSettings={{ myLocationButtonEnabled: Boolean(userLocation) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
});
