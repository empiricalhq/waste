import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useFadeIn } from "@/hooks/use-fade-in";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";
import { ReportForm } from "../components/report-form";
import { useCreateReport } from "../hooks/use-create-report";

export function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const { mutateAsync: createReport, isPending } = useCreateReport();
  const animatedStyle = useFadeIn({ translateY: 30 });

  const handleSubmit = async (data: CreateReportInput) => {
    try {
      await createReport(data);
      show("Reporte enviado correctamente", {
        type: "success",
        position: "bottom",
      });
      router.back();
    } catch (error: any) {
      show(error.message || "Error al enviar reporte", {
        type: "error",
        position: "bottom",
        action: {
          label: "Reintentar",
          onPress: () => handleSubmit(data),
        },
      });
    }
  };

  const handleGoToProfile = () => {
    if (router.canGoBack()) {
      router.back();
    }
    // replace is better to not build up a weird history stack
    router.replace("/(tabs)/profile");
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Animated.View
          style={[styles.content, styles.centerContent, animatedStyle]}
        >
          <Text style={styles.title}>Inicia sesión</Text>
          <Text style={styles.message}>
            Necesitas iniciar sesión para enviar reportes
          </Text>
          <Button title="Ir al perfil" onPress={handleGoToProfile} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Animated.View style={animatedStyle}>
          <ReportForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </Animated.View>
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    lineHeight: 22,
  },
});
