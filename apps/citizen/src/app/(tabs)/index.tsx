import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Loading } from "@/components/ui/Loading";
import { WASTE_TYPES } from "@/constants";
import { useNextCollection } from "@/hooks/use-collections";
import { useNetwork } from "@/hooks/use-network";
import { useNearestTruck } from "@/hooks/use-trucks";
import { theme } from "@/theme";

export default function HomeScreen() {
  const {
    nextCollection,
    isLoading: loadingCollection,
    error: collectionError,
    refetch: refetchCollection,
  } = useNextCollection();
  const {
    nearestTruck,
    isLoading: loadingTruck,
    error: truckError,
    refetch: refetchTruck,
  } = useNearestTruck();
  const { isOffline } = useNetwork();

  if (loadingCollection || loadingTruck) {
    return <Loading />;
  }

  if (collectionError || truckError) {
    return (
      <ErrorMessage
        message={isOffline ? "Sin conexión" : "Error al cargar datos"}
        isOffline={isOffline}
        onRetry={() => {
          refetchCollection();
          refetchTruck();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Inicio</Text>

      {nextCollection && (
        <Card style={styles.section}>
          <Text style={styles.label}>Próxima recolección</Text>
          <View style={styles.row}>
            <View
              style={[
                styles.dot,
                { backgroundColor: WASTE_TYPES[nextCollection.type].color },
              ]}
            />
            <View>
              <Text style={styles.type}>
                {WASTE_TYPES[nextCollection.type].label}
              </Text>
              <Text style={styles.time}>
                {nextCollection.date} - {nextCollection.time}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {nearestTruck && (
        <Card style={styles.section}>
          <Text style={styles.label}>Camión cercano</Text>
          <View style={styles.row}>
            <View
              style={[
                styles.dot,
                { backgroundColor: WASTE_TYPES[nearestTruck.type].color },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.type}>
                {WASTE_TYPES[nearestTruck.type].label}
              </Text>
              <Text style={styles.time}>{nearestTruck.route}</Text>
            </View>
            <View>
              <Text style={styles.eta}>{nearestTruck.eta}</Text>
              <Text style={styles.etaLabel}>min</Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    fontSize: theme.text.xxxl,
    fontWeight: "700",
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  type: {
    fontSize: theme.text.base,
    fontWeight: "600",
  },
  time: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
  },
  eta: {
    fontSize: theme.text.xxl,
    fontWeight: "700",
    textAlign: "right",
  },
  etaLabel: {
    fontSize: theme.text.xs,
    color: theme.colors.textSecondary,
  },
});
