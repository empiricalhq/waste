'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type Route = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  estimated_duration_minutes: number;
  created_by_name: string | null;
  waypoint_count: string;
};

interface RoutesTableProps {
  initialRoutes: Route[];
}

export function RoutesTable({ initialRoutes }: RoutesTableProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Ruta</TableHead>
              <TableHead>Creado por</TableHead>
              <TableHead className="text-center">N° de Waypoints</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRoutes.length > 0 ? (
              initialRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{route.created_by_name || 'No disponible'}</TableCell>
                  <TableCell className="text-center">{route.waypoint_count}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedRoute(route)}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron rutas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(selectedRoute)} onOpenChange={() => setSelectedRoute(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedRoute && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRoute.name}</DialogTitle>
                <DialogDescription>{selectedRoute.description || 'Sin descripción.'}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <strong>Creado por:</strong> {selectedRoute.created_by_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Estado:</strong> <span className="capitalize">{selectedRoute.status}</span>
                  </p>
                  <p>
                    <strong>Waypoints:</strong> {selectedRoute.waypoint_count}
                  </p>
                  <p>
                    <strong>Duración estimada:</strong> {selectedRoute.estimated_duration_minutes} min
                  </p>
                </div>
                {/* Aquí iría el mapa y la lista de waypoints */}
                <div className="bg-secondary mt-4 flex h-64 w-full items-center justify-center rounded-md text-center">
                  <p className="text-muted-foreground">(Espacio para el mapa de la ruta)</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
