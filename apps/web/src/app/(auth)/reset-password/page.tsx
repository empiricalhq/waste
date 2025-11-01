import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restablecer contraseña - Lima Limpia',
  description: 'Establece una nueva contraseña para tu cuenta',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ResetPasswordForm />
    </div>
  );
}
