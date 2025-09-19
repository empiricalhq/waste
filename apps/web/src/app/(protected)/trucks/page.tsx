import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getTrucks } from '@/features/trucks/actions';

export default async function TrucksPage() {
  const trucks = await getTrucks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de vehículos</h1>
        <p className="text-muted-foreground">Administra la flota de vehículos y sus conductores asignados</p>
      </div>
      <Card>
        <CardContent>
          <div className="space-y-4">
            {trucks.map((truck) => (
              <div key={truck.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <div>
                  <p className="font-medium">{truck.name}</p>
                  <p className="text-muted-foreground text-xs">{truck.license_plate}</p>
                </div>
                <Badge variant={truck.is_active ? 'default' : 'secondary'}>
                  {truck.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            ))}
            {trucks.length === 0 && <p className="text-muted-foreground text-center">No se encontraron vehículos.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const runtime = 'edge';
