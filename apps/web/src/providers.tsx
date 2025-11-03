'use client';

import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { ApiStatusMonitor } from '@/components/common/api-status-monitor';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader easing="ease" showSpinner={false} color="var(--primary)" />
      <ApiStatusMonitor />
      {children}
      <Toaster position="top-center" />
    </>
  );
}
