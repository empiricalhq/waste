import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";
// import { LogOut } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

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
        <Button title="Cerrar Sesión" onPress={logout} variant="secondary" />
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
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
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
