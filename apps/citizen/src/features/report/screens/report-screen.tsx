import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "@/context/toast-context";
import { AuthForm } from "@/features/auth/components/auth-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";
import { ReportForm } from "../components/report-form";
import { useCreateReport } from "../hooks/use-create-report";

export function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const { mutateAsync: createReport, isPending } = useCreateReport();
  const [pendingReport, setPendingReport] = useState<CreateReportInput | null>(
    null,
  );

  const handleSubmit = async (data: CreateReportInput) => {
    try {
      await createReport(data);
      show("Reporte enviado correctamente", {
        type: "success",
      });
      router.replace("/");
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Ocurrió un error inesperado al enviar el reporte.";

      show(message, {
        type: "error",
        action: {
          label: "Reintentar",
          onPress: () => handleSubmit(data),
        },
      });
    }
  };

  const handleAuthSuccess = () => {
    // after successful auth, if there was a pending report, submit it
    if (pendingReport) {
      handleSubmit(pendingReport);
      setPendingReport(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.authWrapper}>
            <Text style={styles.title}>Inicia sesión para continuar</Text>
            <Text style={styles.message}>
              Necesitas una cuenta para enviar reportes
            </Text>
            <AuthForm onSuccess={handleAuthSuccess} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <ReportForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  authWrapper: {
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});
