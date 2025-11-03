import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PasswordResetFlow } from '@/components/auth/password-reset-flow';

export const metadata: Metadata = {
  title: 'Olvidé mi contraseña - Lima Limpia',
  description: 'Restablece tu contraseña de Lima Limpia',
};

export const runtime = 'edge';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PasswordResetFlow mode="request" />
    </Suspense>
  );
}
