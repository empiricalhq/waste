import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/app-config';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { useLogin } from '@/features/auth/hooks/use-login';
import { loginSchema } from '@/features/auth/schemas';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isPending, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate form data
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as 'email' | 'password';
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Submit login
    login(result.data, {
      onSuccess: () => {
        router.replace(ROUTES.HOME);
      },
      onError: (err) => {
        Alert.alert('Error de Inicio de Sesión', (err as Error).message || 'No se pudo iniciar sesión.');
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Input
        label="Email"
        placeholder="tu@email.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {validationErrors.email && <Text style={styles.fieldError}>{validationErrors.email}</Text>}
      <Input
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      {validationErrors.password && <Text style={styles.fieldError}>{validationErrors.password}</Text>}
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title="Entrar" onPress={handleLogin} loading={isPending} disabled={isPending} />
      <Button
        title="Crear cuenta"
        variant="secondary"
        onPress={() => router.push(ROUTES.SIGN_UP)}
        style={{ marginTop: Spacing.md }}
        disabled={isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    color: Colors.text,
  },
  error: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  fieldError: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
