import type { ReactNode } from 'react';
import { marketingTheme } from '@/config/marketing';

export interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`min-h-screen ${className}`} style={{ backgroundColor: marketingTheme.colors.background }}>
      {children}
    </div>
  );
}
