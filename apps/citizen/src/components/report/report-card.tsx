import { Clock } from "lucide-react-native";
import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import type { Report } from "@/types";

interface ReportCardProps {
  report: Report;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  // const _isPending = report.status === "pending";
  const isOptimistic = report.id.startsWith("temp-");

  const getStatusColor = () => {
    switch (report.status) {
      case "pending":
        return Colors.warning;
      case "in-progress":
        return Colors.info;
      case "resolved":
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (report.status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En progreso";
      case "resolved":
        return "Resuelto";
      default:
        return report.status;
    }
  };

  return (
    <View style={[styles.container, isOptimistic && styles.optimistic]}>
      <View style={styles.header}>
        <Text style={styles.type}>{report.type}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {report.description}
      </Text>

      {isOptimistic && (
        <View style={styles.pendingIndicator}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.pendingText}>Enviando...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  optimistic: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  type: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textInverse,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  pendingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pendingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
});
