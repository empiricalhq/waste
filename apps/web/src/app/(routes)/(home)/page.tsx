import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMe } from '@/actions/user';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// biome-ignore lint: cloudflare requires edge runtime
export const runtime = 'edge';

export default async function Home() {
  const me = await getMe();
  if (me) {
    return redirect('/dashboard/principal');
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bienvenido a Lima-limpia</h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Gestiona tus rutas y choferes de forma eficiente. Inicia sesión para comenzar.
          </p>
          <div className="mt-8">
            <Link href="/signin" className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-background text-muted-foreground border-t px-6 py-4 text-center text-sm">
        <p>Síguenos en nuestras redes sociales | Contacto: info@waste.com</p>
      </footer>
    </div>
  );
}
