import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { theme } from "@/theme";
import type { QuizProgress } from "@/types";

export default function ProfileScreen() {
  const { user, isAuthenticated, login, signUp, logout, isAuthLoading } =
    useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState<QuizProgress | null>(null);

  useEffect(() => {
    storage.getQuizProgress().then(setProgress);
  }, []);

  const handleAuth = async () => {
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signUp({ name, email, password });
      }
      setEmail("");
      setPassword("");
      setName("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error de autenticación");
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
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
          title={mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          variant="ghost"
          onPress={() => setMode((m) => (m === "login" ? "signup" : "login"))}
        />
      </ScrollView>
    );
  }

  const accuracy =
    progress && progress.totalAnswered > 0
      ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100)
      : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
            <Text style={styles.statValue}>{progress?.totalAnswered || 0}</Text>
            <Text style={styles.statLabel}>Respondidas</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Cerrar sesión"
        variant="secondary"
        onPress={handleLogout}
      />
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
