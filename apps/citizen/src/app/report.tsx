import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { ReportForm } from "@/components/report-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCreateReport } from "@/lib/queries";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";

export default function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const handleSubmit = async (data: CreateReportInput) => {
    try {
      await createReport(data);
      Alert.alert("Éxito", "Reporte enviado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al enviar reporte");
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Inicia sesión</Text>
          <Text style={styles.message}>
            Necesitas iniciar sesión para enviar reportes
          </Text>
          <Button
            title="Ir al perfil"
            onPress={() => {
              router.back();
              router.push("/(tabs)/profile");
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ReportForm onSubmit={handleSubmit} isSubmitting={isPending} />
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
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
});
