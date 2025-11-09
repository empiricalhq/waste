import type { ReactNode } from 'react';
import { FeatureErrorBoundary } from '@/components/shared/feature-error-boundary';

interface ReportFeatureWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component for the reports feature that provides error boundary protection
 */
export function ReportFeatureWrapper({ children }: ReportFeatureWrapperProps) {
  return (
    <FeatureErrorBoundary
      featureName="Reportes"
      fallbackTitle="Error en el módulo de reportes"
      fallbackMessage="Ocurrió un error al procesar tu reporte. Por favor, intenta de nuevo."
    >
      {children}
    </FeatureErrorBoundary>
  );
}
