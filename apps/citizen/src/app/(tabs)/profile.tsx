import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { storage } from "@/lib/storage";
import { theme } from "@/theme";
import type { QuizProgress } from "@/types";

export default function ProfileScreen() {
  const { user, isAuthenticated, login, signUp, logout, isAuthLoading } =
    useAuth();
  const { show } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState<QuizProgress | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    storage.getQuizProgress().then(setProgress);
  }, [isAuthenticated]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: theme.animation.duration.slow });
    translateY.value = withSpring(0, theme.animation.easing.spring);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleAuth = async () => {
    try {
      if (mode === "login") {
        await login({ email, password });
        show("Sesión iniciada correctamente", {
          type: "success",
          position: "bottom",
        });
      } else {
        await signUp({ name, email, password });
        show("Cuenta creada correctamente", {
          type: "success",
          position: "bottom",
        });
      }
      setEmail("");
      setPassword("");
      setName("");
    } catch (error: any) {
      show(error.message || "Error de autenticación", {
        type: "error",
        position: "bottom",
      });
    }
  };

  const handleLogout = () => {
    show("¿Cerrar sesión?", {
      type: "warning",
      position: "bottom",
      duration: 4000,
      action: {
        label: "Confirmar",
        onPress: async () => {
          await logout();
          show("Sesión cerrada", {
            type: "info",
            position: "bottom",
          });
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
          <Animated.View style={animatedStyle}>
            <Text style={styles.title}>
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Text>
            <Text style={styles.description}>
              {mode === "login"
                ? "Inicia sesión para reportar problemas y guardar tu progreso"
                : "Crea una cuenta para reportar problemas y guardar tu progreso"}
            </Text>

            {mode === "signup" && (
              <Input label="Nombre" value={name} onChangeText={setName} />
            )}

            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <Button
              title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              onPress={handleAuth}
              loading={isAuthLoading}
              fullWidth={true}
            />

            <Button
              title={
                mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"
              }
              variant="ghost"
              onPress={() =>
                setMode((m) => (m === "login" ? "signup" : "login"))
              }
            />
          </Animated.View>
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
        <Animated.View style={animatedStyle}>
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <Card variant="elevated">
            <Text style={styles.cardTitle}>Estadísticas del quiz</Text>
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
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
