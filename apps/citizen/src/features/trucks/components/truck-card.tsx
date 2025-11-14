import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { WASTE_TYPES } from "@/constants";
import { theme } from "@/theme";
import type { TruckStatus } from "@/types";

interface TruckCardProps {
  status: TruckStatus;
}

export function TruckCard({ status }: TruckCardProps) {
  if (status.status === "not_scheduled") {
    return (
      <Card variant="elevated">
        <Text style={styles.label}>Recolección de basura</Text>
        <Text style={styles.message}>
          La recolección en tu zona no está programada todavía. Te notificaremos
          cuando esté disponible.
        </Text>
      </Card>
    );
  }

  if (status.status === "idle") {
    return (
      <Card variant="elevated">
        <Text style={styles.label}>Recolección de basura</Text>
        <Text style={styles.message}>
          {status.message ||
            "No hay camiones cerca en este momento. Sigue atento a las actualizaciones."}
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <Text style={styles.label}>Camión cercano</Text>
      <View style={styles.row}>
        <View style={[styles.dot, styles.generalDot]} />
        <View style={styles.content}>
          <Text style={styles.type}>{WASTE_TYPES.general.label}</Text>
          <Text style={styles.subtitle}>{status.message}</Text>
        </View>
        <View style={styles.eta}>
          <Text style={styles.etaValue}>{status.etaMinutes}</Text>
          <Text style={styles.etaLabel}>min</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
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
  generalDot: {
    backgroundColor: WASTE_TYPES.general.color,
  },
  content: {
    flex: 1,
  },
  type: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  eta: {
    alignItems: "flex-end",
  },
  etaValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  etaLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
