"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  Truck,
  MapPin,
} from "lucide-react";
import { getMe } from "@/actions/user";
import { UserType } from "@/db/schema";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Choferes", href: "/dashboard/drivers", icon: Users },
  { name: "Ubicaciones", href: "/dashboard/locations", icon: MapPin },
  { name: "Vehículos", href: "/dashboard/vehicles", icon: Truck },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData || null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-50 w-64 transform border-r transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-sidebar-border flex items-center border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-sidebar-accent flex h-8 w-8 items-center justify-center rounded-lg">
                <Truck className="text-sidebar-accent-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sidebar-foreground text-lg font-bold">
                  Lima-limpia
                </h1>
                <p className="text-muted-foreground text-xs">
                  Gestión de usuarios
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/100",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-sidebar-border border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-sidebar-accent flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-sidebar-accent-foreground text-sm font-medium">
                  A
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sidebar-foreground truncate text-sm font-medium">
                  {isLoading
                    ? "Cargando..."
                    : user?.name || "No se pudo fetchear el nombre"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {isLoading
                    ? "Cargando..."
                    : user?.email || "No se pudo fetchear el email"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
