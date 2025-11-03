import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PasswordResetFlow } from '@/components/auth/password-reset-flow';

export const metadata: Metadata = {
  title: 'Restablecer contraseña - Lima Limpia',
  description: 'Establece una nueva contraseña para tu cuenta',
};

export const runtime = 'edge';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PasswordResetFlow mode="reset" />
    </Suspense>
  );
}
