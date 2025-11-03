import type { Metadata } from 'next';
import { PasswordResetFlow } from '@/components/auth/password-reset-flow';

export const metadata: Metadata = {
  title: 'Olvidé mi contraseña - Lima Limpia',
  description: 'Restablece tu contraseña de Lima Limpia',
};

export default function ForgotPasswordPage() {
  return <PasswordResetFlow mode="request" />;
}
