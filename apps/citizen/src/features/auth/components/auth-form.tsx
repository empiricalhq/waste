import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { theme } from "@/theme";

export function AuthForm() {
  const { login, signUp, isAuthLoading } = useAuth();
  const { show } = useToast();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isVisible = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible.value ? 1 : 0, {
      duration: theme.animation.duration.slow,
    }),
    transform: [
      {
        translateY: withSpring(
          isVisible.value ? 0 : 20,
          theme.animation.easing.spring,
        ),
      },
    ],
  }));

  const onLayout = () => {
    isVisible.value = true;
  };

  const handleAuth = async () => {
    try {
      if (mode === "login") {
        await login({ email, password });
        show("Sesión iniciada correctamente", { type: "success" });
      } else {
        await signUp({ name, email, password });
        show("Cuenta creada correctamente", { type: "success" });
      }
      // no need to clear form state. component will unmount on success.
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
