import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { theme } from "@/theme";
import type { TruckStatus } from "@/types";

interface TruckCardProps {
  status: TruckStatus;
}

export function TruckCard({ status }: TruckCardProps) {
  if (status.status === "not_scheduled") {
    return (
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Recolección de basura</Text>
        <Text style={styles.message}>
          La recolección en tu zona no está programada. Te notificaremos cuando
          esté disponible.
        </Text>
      </Card>
    );
  }

  if (status.status === "idle") {
    return (
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Recolección de basura</Text>
        <Text style={styles.message}>
          {status.message ||
            "No hay camiones cerca. Sigue atento a las actualizaciones."}
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <Text style={styles.sectionTitle}>Camión cercano</Text>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.type}>Basura general</Text>
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
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing["spacing-s"],
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["spacing-m"],
  },
  content: {
    flex: 1,
  },
  type: {
    ...theme.typography.headline,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.footnote,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  message: {
    ...theme.typography.callout,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  eta: {
    alignItems: "flex-end",
  },
  etaValue: {
    ...theme.typography.title1,
    color: theme.colors.textPrimary,
  },
  etaLabel: {
    ...theme.typography.caption,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
    marginTop: -theme.spacing["spacing-xs"],
  },
});
