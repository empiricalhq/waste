import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import SignOutButton from "../(auth)/components/button-signout";
import { getMe } from "@/actions/user";
import { SimpleDashboard } from "@/components/dashboard"
import { AddDriverModal } from "@/components/add-driver-modal";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
//import { Dashboard }  from "@/components/dashboard"

export default async function Home() {
  const me = await getMe();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start w-full">
        {me ? (
          <div>
            <DashboardSidebar />
            <div className="lg:pl-64">
              <DashboardHeader />
              <main className="p-6">
                <SimpleDashboard />
              </main>
            </div>
          </div>
        ) : (
          <Link
            href={"/signin"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Iniciar Sesión
          </Link>
        )}
      </main>
      
    </div>
    /*Consider adding a footer to add social media and contacts*/
  );
}