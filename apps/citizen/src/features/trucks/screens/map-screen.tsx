import { Platform, StyleSheet, Text, View } from "react-native";
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

  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return (
      <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
        <Text style={styles.message}>
          Los mapas solo están disponibles en iOS y Android
        </Text>
      </SafeAreaView>
    );
  }

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
        <ErrorState message="Error al cargar camiones" onRetry={refetch} />
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
              {trucks.length} camión{trucks.length !== 1 ? "es" : ""} activo
              {trucks.length !== 1 ? "s" : ""}
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
