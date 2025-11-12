import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useCollections } from "@/hooks/use-collections";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useNetwork } from "@/hooks/use-network";
import { theme } from "@/theme";
import { WASTE_TYPES } from "@/constants";

export default function ScheduleScreen() {
  const { data: collections = [], isLoading, error, refetch } = useCollections();
  const { isOffline } = useNetwork();

  if (isLoading) return <Loading />;
  
  if (error) {
    return (
      <ErrorMessage
        message={isOffline ? "Sin conexión" : "Error al cargar el calendario"}
        isOffline={isOffline}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendario</Text>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.card, item.completed && styles.completed]}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: WASTE_TYPES[item.type].color }]} />
              <View>
                <Text style={styles.type}>{WASTE_TYPES[item.type].label}</Text>
                <Text style={styles.time}>{item.date} - {item.time}</Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay recolecciones programadas</Text>
        }
      />
    </View>
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
  card: {
    marginBottom: theme.spacing.md,
  },
  completed: {
    opacity: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
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
  empty: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});
