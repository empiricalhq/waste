import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";

interface ReportSuccessStepProps {
  onDone: () => void;
}

export const ReportSuccessStep: React.FC<ReportSuccessStepProps> = ({ onDone }) => {
  return (
    <View style={styles.container}>
      <CheckCircle2 size={80} color={Colors.success} />
      <Text style={styles.title}>Reporte Enviado</Text>
      <Text style={styles.message}>
        Gracias por tu colaboración. Hemos recibido tu reporte y lo revisaremos pronto.
      </Text>
      <Button title="Hecho" onPress={onDone} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxxl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  button: {
    alignSelf: "stretch",
  },
});
