import { Stack } from "expo-router";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { ANIMATION_DURATIONS } from "@/constants/animations";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

function AuthLayout() {
  const reducedMotion = useReducedMotion();

  return (
    <FeatureErrorBoundary
      featureName="Autenticación"
      fallbackTitle="Error de autenticación"
      fallbackMessage="Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo."
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: reducedMotion ? "fade" : "slide_from_right",
          animationDuration: reducedMotion
            ? ANIMATION_DURATIONS.QUICK
            : ANIMATION_DURATIONS.NORMAL,
        }}
      />
    </FeatureErrorBoundary>
  );
}

export default AuthLayout;
