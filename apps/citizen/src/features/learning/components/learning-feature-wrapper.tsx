import type { ReactNode } from 'react';
import { FeatureErrorBoundary } from '@/components/shared/feature-error-boundary';

interface LearningFeatureWrapperProps {
  children: ReactNode;
  onReset?: () => void;
}

/**
 * Wrapper component that provides error boundary for the learning feature
 */
export function LearningFeatureWrapper({ children, onReset }: LearningFeatureWrapperProps) {
  return (
    <FeatureErrorBoundary
      featureName="Aprendizaje"
      fallbackTitle="Error en aprendizaje"
      fallbackMessage="Ocurrió un error al cargar el contenido educativo. Por favor, intenta de nuevo."
      onReset={onReset}
    >
      {children}
    </FeatureErrorBoundary>
  );
}
