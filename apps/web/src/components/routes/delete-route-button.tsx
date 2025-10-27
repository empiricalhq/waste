"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteRoute } from "@/features/routes/actions";

interface DeleteRouteButtonProps {
  routeId: string;
  routeName?: string | null;
}

export function DeleteRouteButton({ routeId, routeName }: DeleteRouteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const safeName = routeName?.trim() || "esta ruta";
    if (!window.confirm(`¿Seguro que deseas eliminar ${safeName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRoute(routeId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ruta eliminada.");
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      <span className="sr-only">Eliminar ruta</span>
    </Button>
  );
}

