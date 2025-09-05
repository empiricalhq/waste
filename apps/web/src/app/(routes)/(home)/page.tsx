import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import SignOutButton from "../(auth)/components/button-signout";
import { getMe } from "@/actions/user";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
//import { Dashboard }  from "@/components/dashboard"

export default async function Home() {
  const me = await getMe();
  if (me) {
    return (
      <div>
        <DashboardSidebar />
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="p-6">
            <h1 className="mb-1 text-3xl font-bold">Dashboard</h1>
            <p className="mb-5">
              Sistema de gestión de administradores, supervisores y choferes
            </p>
            <DashboardStats />
            <RecentActivity />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Bienvenido a Lima-limpia
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Gestiona tus rutas y choferes de forma eficiente. Inicia sesión para
            comenzar.
          </p>
          <div className="mt-8">
            <Link
              href={"/signin"}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Iniciar Sesión
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
