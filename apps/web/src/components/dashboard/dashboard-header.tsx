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
