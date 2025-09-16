'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define el tipo de dato para un usuario
export type User = {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'supervisor' | 'driver';
};

// Mapeo de roles a etiquetas legibles
const roleLabels: { [key in User['role']]: string } = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  driver: 'Chofer',
};

interface UsersTableProps {
  initialUsers: User[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialUsers.length > 0 ? (
            initialUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{roleLabels[user.role]}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm">
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
