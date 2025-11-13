import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useFadeIn } from "@/hooks/use-fade-in";
import { theme } from "@/theme";
import type { SignUpInput } from "@/types";

type FormData = SignUpInput;

const EMAIL_REGEX = /^\S+@\S+$/i;

export function AuthForm() {
  const { login, signUp } = useAuth();
  const { show } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [animatedStyle, onLayout] = useFadeIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleAuth = async (data: FormData) => {
    try {
      if (mode === "login") {
        await login({ email: data.email, password: data.password });
        show("Sesión iniciada correctamente", { type: "success" });
      } else {
        await signUp({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        show("Cuenta creada correctamente", { type: "success" });
      }
    } catch (error: any) {
      show(error.message || "Error de autenticación", { type: "error" });
    }
  };

  return (
    <Animated.View
      onLayout={onLayout}
      style={[styles.container, animatedStyle]}
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
        <Controller
          control={control}
          name="name"
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nombre"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "El correo es obligatorio",
          pattern: {
            value: EMAIL_REGEX,
            message: "Correo electrónico inválido",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Correo electrónico"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "La contraseña debe tener al menos 6 caracteres",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Contraseña"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
            secureTextEntry={true}
          />
        )}
      />

      <Button
        title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        onPress={handleSubmit(handleAuth)}
        loading={isSubmitting}
        fullWidth={true}
      />
      <Button
        title={mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
        variant="ghost"
        onPress={() => setMode((m) => (m === "login" ? "signup" : "login"))}
        disabled={isSubmitting}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
