import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/app-config';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';
import { useSignUp } from '@/features/auth/hooks/use-sign-up';
import { signUpSchema } from '@/features/auth/schemas';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';

export default function SignUpScreen() {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const { signUp, isPending, error, reset } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleSignUp = () => {
    setValidationErrors({});
    reset();

    const result = signUpSchema.safeParse({ name, email, password });

    if (!result.success) {
      const errors: { name?: string; email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as 'name' | 'email' | 'password';
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    signUp(result.data, {
      onSuccess: () => {
        router.replace(ROUTES.HOME);
      },
      onError: (err) => {
        console.error('Sign up error:', err);
      },
    });
  };

  const handleRetry = () => {
    reset();
    handleSignUp();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

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
        label="Nombre"
        placeholder="Tu nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
      />
      {validationErrors.name && <Text style={styles.fieldError}>{validationErrors.name}</Text>}
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
      <Button title="Registrarse" onPress={handleSignUp} loading={isPending} disabled={isPending} />
      <Button
        title="Ya tengo cuenta"
        variant="secondary"
        onPress={() => router.back()}
        style={{ marginTop: Spacing.md }}
        disabled={isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  fieldError: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
