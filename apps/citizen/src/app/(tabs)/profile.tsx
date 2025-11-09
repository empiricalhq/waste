import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from '@/components/shared/header';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/constants/app-config';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { useAuth } from '@/features/auth/hooks/use-auth';
// import { LogOut } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace(ROUTES.LOGIN);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Perfil" />
        <View style={styles.content}>
          <CardSkeleton />
        </View>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const accuracy =
    user.progress.totalQuestions > 0
      ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <Header title={user.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Tus Estadísticas</Text>
          <View style={styles.statsContainer}>
            <StatItem value={user.progress.streak} label="Días de racha" />
            <StatItem value={`${accuracy}%`} label="Precisión" />
            <StatItem value={user.progress.totalQuestions} label="Tests" />
          </View>
        </Card>
        <Button title="Cerrar Sesión" onPress={handleLogout} variant="secondary" />
      </ScrollView>
    </View>
  );
}

const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
