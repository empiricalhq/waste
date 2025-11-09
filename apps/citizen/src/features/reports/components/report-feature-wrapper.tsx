import type { ReactNode } from 'react';
import { FeatureErrorBoundary } from '@/components/shared/feature-error-boundary';

interface ReportFeatureWrapperProps {
  children: ReactNode;
  onReset?: () => void;
}

/**
 * Wrapper component that provides error boundary for the reports feature
 */
export function ReportFeatureWrapper({ children, onReset }: ReportFeatureWrapperProps) {
  return (
    <FeatureErrorBoundary
      featureName="Reportes"
      fallbackTitle="Error en reportes"
      fallbackMessage="Ocurrió un error al procesar tu reporte. Por favor, intenta de nuevo."
      onReset={onReset}
    >
      {children}
    </FeatureErrorBoundary>
  );
}
