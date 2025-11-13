import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ReportForm } from "@/features/report/components/report-form";
import { useCreateReport } from "@/features/report/hooks/use-create-report";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";

export default function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const isVisible = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible.value ? 1 : 0, {
      duration: theme.animation.duration.slow,
    }),
    transform: [
      {
        translateY: withSpring(
          isVisible.value ? 0 : 30,
          theme.animation.easing.spring,
        ),
      },
    ],
  }));

  const onLayout = () => {
    isVisible.value = true;
  };

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

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Animated.View
          style={[styles.content, styles.centerContent, animatedStyle]}
          onLayout={onLayout}
        >
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
        <Animated.View onLayout={onLayout} style={animatedStyle}>
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
