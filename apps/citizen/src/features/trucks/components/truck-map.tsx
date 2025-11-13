import { AppleMaps, GoogleMaps } from "expo-maps";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { DEFAULT_MAP_CENTER } from "@/constants";
import { theme } from "@/theme";
import type { LocationCoords, Truck } from "@/types";

interface TruckMapProps {
  trucks: Truck[];
  userLocation?: LocationCoords | null;
}

const MemoizedTruckMarker = React.memo(function TruckMarker({
  truck,
  MarkerComponent,
}: {
  truck: Truck;
  MarkerComponent: typeof AppleMaps.Marker | typeof GoogleMaps.Marker;
}) {
  const coordinates = {
    latitude: truck.lat,
    longitude: truck.lng,
  };
  return (
    <MarkerComponent
      key={truck.id}
      coordinates={coordinates}
      title={truck.name}
      // the snippet prop is only available on Google Maps for Android.
      {...(Platform.OS === "android" && {
        snippet: `Placa: ${truck.licensePlate}`,
      })}
    />
  );
});

export function TruckMap({ trucks, userLocation }: TruckMapProps) {
  const MapComponent = Platform.OS === "ios" ? AppleMaps.View : GoogleMaps.View;
  const MarkerComponent =
    Platform.OS === "ios" ? AppleMaps.Marker : GoogleMaps.Marker;

  const camera = useMemo(
    () =>
      userLocation
        ? { coordinates: userLocation, zoom: 13 }
        : DEFAULT_MAP_CENTER,
    [userLocation],
  );

  return (
    <View style={styles.container}>
      <MapComponent
        style={styles.map}
        cameraPosition={camera}
        properties={{ isMyLocationEnabled: Boolean(userLocation) }}
        uiSettings={{ myLocationButtonEnabled: Boolean(userLocation) }}
      >
        {trucks.map((truck) => (
          <MemoizedTruckMarker
            key={truck.id}
            truck={truck}
            MarkerComponent={MarkerComponent}
          />
        ))}
      </MapComponent>
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
