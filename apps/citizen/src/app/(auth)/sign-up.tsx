import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { SignUpSchema } from "@/lib/schemas";
import { theme } from "@/theme";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, isLoading } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    const result = SignUpSchema.safeParse({ name, email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await signUp(result.data);
    } catch (error: any) {
      setErrors({ general: error.message || "Error al crear cuenta" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {errors.general && <Text style={styles.error}>{errors.general}</Text>}

      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />

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
        secureTextEntry={true}
        error={errors.password}
      />

      <Button title="Registrarse" onPress={handleSignUp} loading={isLoading} />

      <Button
        title="Ya tengo cuenta"
        variant="secondary"
        onPress={() => router.back()}
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
