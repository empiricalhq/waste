import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/app-config";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";
import { useLogin } from "@/features/auth/hooks/use-login";
import { loginSchema } from "@/features/auth/schemas";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";

export default function LoginScreen() {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const { login, isPending, error, reset } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = () => {
    setValidationErrors({});
    reset();

    // Validate form data
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as "email" | "password";
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    login(result.data, {
      onSuccess: () => {
        router.replace(ROUTES.HOME);
      },
      onError: (err) => {
        console.error("Login error:", err);
      },
    });
  };

  const handleRetry = () => {
    reset();
    handleLogin();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      {error && (
        <ErrorState
          error={error}
          onRetry={handleRetry}
          isOffline={isOffline}
          isRetrying={isPending}
          variant="compact"
        />
      )}

      <Input
        label="Email"
        placeholder="tu@email.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {validationErrors.email && (
        <Text style={styles.fieldError}>{validationErrors.email}</Text>
      )}
      <Input
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      {validationErrors.password && (
        <Text style={styles.fieldError}>{validationErrors.password}</Text>
      )}
      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={isPending}
        disabled={isPending}
      />
      <Button
        title="Crear cuenta"
        variant="secondary"
        onPress={() => router.push(ROUTES.SIGN_UP)}
        style={{ marginTop: Spacing.md }}
        disabled={isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xxxl,
    color: Colors.text,
  },
  fieldError: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
