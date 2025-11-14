import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { useLocation } from "@/features/map/hooks/use-location";
import { useTrucks } from "@/features/trucks/hooks/use-trucks";
import { theme } from "@/theme";
import { TruckMap } from "../components/truck-map";

export function MapScreen() {
  const {
    data: trucks = [],
    isLoading: isLoadingTrucks,
    error,
    refetch,
  } = useTrucks();
  const { coords: userLocation, isLoading: isLoadingLocation } = useLocation({
    fetchOnMount: true,
  });

  if (isLoadingTrucks || isLoadingLocation) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <Loading message="Cargando mapa..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <ErrorState
          message="No se pudo cargar el mapa. Verifica tu conexión."
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <TruckMap trucks={trucks} userLocation={userLocation} />
      {trucks.length > 0 && (
        <SafeAreaView style={styles.badgeContainer} edges={["top"]}>
          <View style={[styles.badge, theme.shadow.md]}>
            <Text style={styles.badgeText}>
              {trucks.length} en servicio ahora
            </Text>
          </View>
        </SafeAreaView>
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
    backgroundColor: theme.colors.background,
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    pointerEvents: "none",
  },
  badge: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
  },
  badgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
});
