"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { useState } from "react";
import { AddUserModal } from "@/components/dashboard/add-user-modal";

export function DashboardHeader() {
  const [isPending, setIsPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSignOut = async () => {
    setIsPending(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsPending(false);
          redirect("/");
        },
      },
    });
  };

  const handleAddUser = (user: {
    name: string;
    phone: string;
    role: string;
  }) => {
    console.log("Nuevo usuario agregado:", user);
    // Aquí iría la lógica para guardar el usuario en la base de datos
  };

  return (
    <>
      <header className="bg-card border-border border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar usuario
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full text-xs">
                3
              </span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="text-accent-foreground text-sm font-medium">
                      A
                    </span>
                  </div>
                  <span className="hidden text-sm font-medium md:block">
                    Admin
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
    </>
  );
}
