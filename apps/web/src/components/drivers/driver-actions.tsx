'use client';

import { MoreHorizontal } from 'lucide-react';
import { EditDriverDialog } from '@/components/drivers/edit-driver-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/api-contract';

export function DriverActions({ driver }: { driver: User }) {
  return (
    <EditDriverDialog driver={driver}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </EditDriverDialog>
  );
}
