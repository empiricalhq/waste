import { Stack } from 'expo-router';
import { FeatureErrorBoundary } from '@/components/shared/feature-error-boundary';

export default function AuthLayout() {
  return (
    <FeatureErrorBoundary
      featureName="Autenticación"
      fallbackTitle="Error de autenticación"
      fallbackMessage="Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo."
    >
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureErrorBoundary>
  );
}
