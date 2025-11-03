import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/features/auth/lib';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}

export const runtime = 'edge';
