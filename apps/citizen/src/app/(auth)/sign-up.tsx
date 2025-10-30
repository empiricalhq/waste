import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth-service";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";
import { ROUTES } from "@/constants/app-config";

export default function SignUpScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: authService.signUp,
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
      router.replace(ROUTES.HOME);
    },
    onError: (err: any) => {
      Alert.alert("Error de Registro", err.message || "No se pudo crear la cuenta.");
    },
  });

  const handleSignUp = () => {
    // In a real app, get data from state
    mutate({ name: "Nuevo Usuario", email: "new@example.com", password: "password" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Input label="Nombre" placeholder="Tu nombre" />
      <Input label="Email" placeholder="tu@email.com" keyboardType="email-address" />
      <Input label="Contraseña" placeholder="••••••••" secureTextEntry />
      {error && <Text style={styles.error}>{(error as Error).message}</Text>}
      <Button title="Registrarse" onPress={handleSignUp} loading={isPending} />
      <Button
        title="Ya tengo cuenta"
        variant="secondary"
        onPress={() => router.back()}
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
