import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/context/ToastContext";
import { AuthForm } from "@/features/auth/components/auth-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useQuizProgress } from "@/features/quiz/hooks/use-quiz-progress";
import { useFadeIn } from "@/hooks/use-fade-in";
import { theme } from "@/theme";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { show } = useToast();
  const { progress, isLoadingProgress } = useQuizProgress();
  const [animatedStyle, onLayout] = useFadeIn();

  const handleLogout = () => {
    show("¿Cerrar sesión?", {
      type: "warning",
      action: {
        label: "Confirmar",
        onPress: async () => {
          await logout();
          show("Sesión cerrada", { type: "info" });
        },
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <AuthForm />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const accuracy =
    progress && progress.totalAnswered > 0
      ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Animated.View
          onLayout={onLayout}
          style={[styles.contentWrapper, animatedStyle]}
        >
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <Card variant="elevated">
            <Text style={styles.cardTitle}>Estadísticas del quiz</Text>
            {isLoadingProgress ? (
              <Loading />
            ) : (
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{progress?.streak || 0}</Text>
                  <Text style={styles.statLabel}>Racha</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{accuracy}%</Text>
                  <Text style={styles.statLabel}>Precisión</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {progress?.totalAnswered || 0}
                  </Text>
                  <Text style={styles.statLabel}>Respondidas</Text>
                </View>
              </View>
            )}
          </Card>

          <Button
            title="Cerrar sesión"
            variant="secondary"
            onPress={handleLogout}
          />
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
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  contentWrapper: {
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
