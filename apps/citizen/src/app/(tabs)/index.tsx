import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TruckCard } from '../../components/truck-card';
import { Button } from '../../components/ui/button';
import { ErrorState } from '../../components/ui/error-state';
import { Loading } from '../../components/ui/loading';
import { useTruckStatus } from '../../lib/queries';
import { theme } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { data: status, isLoading, error, refetch, isRefetching } = useTruckStatus();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message="Error al cargar información" onRetry={refetch} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <Text style={styles.title}>Inicio</Text>

      {status && <TruckCard status={status} />}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportar problema</Text>
        <Text style={styles.sectionDescription}>
          Informa sobre recolecciones perdidas o problemas con la basura en tu zona
        </Text>
        <Button
          title="Crear reporte"
          onPress={() => router.push('/report')}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sectionDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
});
