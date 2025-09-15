'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type Vehicle = {
  id: string;
  license_plate: string;
  driver_name: string | null;
  is_active: boolean;
};

interface VehiclesTableProps {
  initialVehicles: Vehicle[];
}

export function VehiclesTable({ initialVehicles }: VehiclesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) {
      return initialVehicles;
    }

    return initialVehicles.filter((vehicle) => vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [initialVehicles, searchTerm]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por placa..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Conductor Asignado</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                  <TableCell>{vehicle.driver_name || 'No asignado'}</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.is_active ? 'default' : 'secondary'}>
                      {vehicle.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No se encontraron vehículos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
