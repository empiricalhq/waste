import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReportForm } from "@/components/report-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/lib/auth";
import { useCreateReport } from "@/lib/queries";
import { theme } from "@/theme";
import type { CreateReportInput } from "@/types";

export default function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: theme.animation.duration.slow });
    translateY.value = withSpring(0, theme.animation.easing.spring);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

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
        <Animated.View style={[styles.content, animatedStyle]}>
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
