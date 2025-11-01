import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Olvidé mi contraseña - Lima Limpia',
  description: 'Restablece tu contraseña de Lima Limpia',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ForgotPasswordForm />
    </div>
  );
}
