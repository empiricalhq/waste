import type { Metadata } from 'next';
import { PasswordResetFlow } from '@/components/auth/password-reset-flow';

export const metadata: Metadata = {
  title: 'Restablecer contraseña - Lima Limpia',
  description: 'Establece una nueva contraseña para tu cuenta',
};

export default function ResetPasswordPage() {
  return <PasswordResetFlow mode="reset" />;
}
