import type { ReactNode } from "react";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

interface LearningFeatureWrapperProps {
  children: ReactNode;
}

export function LearningFeatureWrapper({
  children,
}: LearningFeatureWrapperProps) {
  return (
    <FeatureErrorBoundary
      featureName="Aprendizaje"
      fallbackTitle="Error en el módulo de aprendizaje"
      fallbackMessage="Ocurrió un error al cargar el contenido educativo. Por favor, intenta de nuevo."
    >
      {children}
    </FeatureErrorBoundary>
  );
}
