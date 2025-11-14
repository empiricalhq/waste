import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { Screen } from "@/components/ui/screen";
import { useTruckStatus } from "@/features/trucks/hooks/use-truck-status";
import { theme } from "@/theme";
import { TruckCard } from "../components/truck-card";

export function HomeScreen() {
  const router = useRouter();
  const {
    data: status,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useTruckStatus();

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ErrorState
            message="No se pudo cargar la información. Verifica tu conexión."
            onRetry={refetch}
          />
        </View>
      );
    }

    return (
      <View style={styles.contentWrapper}>
        {status && <TruckCard status={status} />}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reportar problema</Text>
          <Text style={styles.sectionDescription}>
            Informa sobre recolecciones perdidas o problemas con la basura en tu
            zona
          </Text>
          <Button
            title="Crear reporte"
            onPress={() => router.push("/report")}
            variant="secondary"
            fullWidth={true}
          />
        </View>
      </View>
    );
  };

  return (
    <Screen isRefreshing={isRefetching} onRefresh={refetch}>
      <Text style={styles.title}>Lima Limpia</Text>
      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    paddingVertical: theme.spacing.xxl,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.text,
  },
  sectionDescription: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
});
