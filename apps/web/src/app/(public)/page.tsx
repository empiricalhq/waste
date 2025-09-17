import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { getCurrentUser } from '@/features/auth/lib';
import { cn } from '@/lib/utils';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome to Lima Limpia</h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Efficiently manage your routes and drivers. Sign in to get started.
          </p>
          <div className="mt-8">
            <Link href="/signin" className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}>
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-background text-muted-foreground border-t px-6 py-4 text-center text-sm">
        <p>Follow us on social media | Contact: info@waste.com</p>
      </footer>
    </div>
  );
}
