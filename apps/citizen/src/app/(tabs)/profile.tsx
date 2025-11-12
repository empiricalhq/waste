import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth";
import { theme } from "@/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const accuracy =
    user.progress.totalQuestions > 0
      ? Math.round(
          (user.progress.correctAnswers / user.progress.totalQuestions) * 100,
        )
      : 0;

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{user.name}</Text>

      <Card>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.progress.streak}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.progress.totalQuestions}</Text>
            <Text style={styles.statLabel}>Tests</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Cerrar sesión"
        variant="secondary"
        onPress={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  header: {
    fontSize: theme.text.xxxl,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: theme.text.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.text.xxl,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: theme.text.sm,
    color: theme.colors.textSecondary,
  },
});
