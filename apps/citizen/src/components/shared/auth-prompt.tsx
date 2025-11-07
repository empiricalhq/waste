import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/app-config';
import { Colors, Spacing, Typography } from '@/constants/design-tokens';

interface AuthPromptProps {
  title: string;
  message: string;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ title, message }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Lock size={48} color={Colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Button title="Iniciar Sesión" onPress={() => router.push(ROUTES.LOGIN)} />
      <Button
        title="Crear Cuenta"
        variant="secondary"
        onPress={() => router.push(ROUTES.SIGN_UP)}
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
