'use client';

import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { SessionProvider } from '@/features/auth/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextTopLoader easing="ease" showSpinner={false} color="var(--primary)" />
      {children}
      <Toaster position="top-center" />
    </SessionProvider>
  );
}
