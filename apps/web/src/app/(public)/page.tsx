import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/lib';
import { LoginForm } from '@/components/auth/login-form';

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
