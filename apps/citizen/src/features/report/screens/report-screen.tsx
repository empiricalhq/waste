import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/ui/screen";
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
      let message = "Ocurrió un error inesperado al enviar el reporte.";
      if (error instanceof ApiError) {
        if (error.code === "AUTH_EXPIRED") {
          message = "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
        } else {
          message = error.message;
        }
      }

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
    if (pendingReport) {
      handleSubmit(pendingReport);
      setPendingReport(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen edges={["bottom"]}>
        <View style={styles.authWrapper}>
          <Text style={styles.title}>Inicia sesión para continuar</Text>
          <Text style={styles.message}>
            Necesitas una cuenta para enviar reportes
          </Text>
          <AuthForm onSuccess={handleAuthSuccess} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <ReportForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
