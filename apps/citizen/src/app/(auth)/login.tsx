import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants";
import { useAuth } from "@/lib/auth";
import { LoginSchema } from "@/lib/schemas";
import { theme } from "@/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const result = LoginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await login(result.data);
    } catch (error: any) {
      setErrors({ general: error.message || "Error al iniciar sesión" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      {errors.general && <Text style={styles.error}>{errors.general}</Text>}

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

      <Button title="Entrar" onPress={handleLogin} loading={isLoading} />

      <Button
        title="Crear cuenta"
        variant="secondary"
        onPress={() => router.push(ROUTES.SIGN_UP)}
        style={{ marginTop: theme.spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.text.xxxl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: theme.spacing.xxxl,
  },
  error: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
});
