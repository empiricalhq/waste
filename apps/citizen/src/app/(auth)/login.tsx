import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";
import { ROUTES } from "@/constants/app-config";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isPending, error } = useLogin();

  const handleLogin = () => {
    // In a real app, get email/password from state
    login({ email: "user@example.com", password: "password" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Input label="Email" placeholder="tu@email.com" keyboardType="email-address" />
      <Input label="Contraseña" placeholder="••••••••" secureTextEntry />
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title="Entrar" onPress={handleLogin} loading={isPending} />
      <Button
        title="Crear cuenta"
        variant="secondary"
        onPress={() => router.push(ROUTES.SIGN_UP)}
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  error: {
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
});
