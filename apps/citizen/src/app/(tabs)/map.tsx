import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
} from 'expo-location';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { memo, useEffect, useState, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Loading } from '@/components/ui/Loading';
import { useNetwork } from '@/hooks/use-network';
import { useTrucksWithLocations } from '@/hooks/queries';
import { theme } from '@/theme';

const DEFAULT_CAMERA = {
  coordinates: { latitude: -12.0464, longitude: -77.0428 },
  zoom: 12,
};

const isSupportedPlatform = Platform.OS === 'ios' || Platform.OS === 'android';

export default memo(function MapScreen() {
  const { data: trucks = [], isLoading, error, refetch } = useTrucksWithLocations();
  const { isOffline } = useNetwork();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!isSupportedPlatform) return;

    (async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (err) {
        console.error('Error getting location:', err);
      }
    })();
  }, []);

  const cameraPosition = useMemo(() => 
    userLocation
      ? { coordinates: userLocation, zoom: 12 }
      : DEFAULT_CAMERA
  , [userLocation]);

  const markers = useMemo(() => 
    trucks.map(truck => ({
      id: truck.id,
      coordinates: { latitude: truck.lat, longitude: truck.lng },
      title: truck.name,
      ...(Platform.OS === 'android' && { snippet: `Placa: ${truck.license_plate}` }),
    }))
  , [trucks]);

  if (!isSupportedPlatform) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>
          Los mapas solo están disponibles en Android e iOS
        </Text>
      </View>
    );
  }

  if (isLoading && trucks.length === 0) {
    return <Loading message="Cargando camiones..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={isOffline ? 'Sin conexión a internet' : 'Error al cargar camiones'}
        isOffline={isOffline}
        onRetry={refetch}
      />
    );
  }

  const MapComponent = Platform.OS === 'ios' ? AppleMaps.View : GoogleMaps.View;

  return (
    <View style={styles.container}>
      <MapComponent
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
        properties={{ isMyLocationEnabled: userLocation !== null }}
        uiSettings={{ myLocationButtonEnabled: true }}
      />
      {trucks.length > 0 && (
        <View style={[styles.infoContainer, theme.shadow.md]}>
          <Text style={styles.infoText}>
            {trucks.length} camión{trucks.length !== 1 ? 'es' : ''} activo{trucks.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  messageText: {
    fontSize: theme.text.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.xxl,
  },
  infoContainer: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  infoText: {
    fontSize: theme.text.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
});
