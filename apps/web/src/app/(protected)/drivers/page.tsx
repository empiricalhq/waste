import { AddDriverDialog } from '@/components/drivers/add-driver-dialog';
import { DriverActions } from '@/components/drivers/driver-actions';
import { Card, CardContent } from '@/components/ui/card';
import { getDrivers } from '@/features/drivers/actions';

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de choferes</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Administra los choferes de la flota</p>
          <AddDriverDialog />
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-muted-foreground text-xs">{driver.email}</p>
                </div>
                <DriverActions driver={driver} />
              </div>
            ))}
            {drivers.length === 0 && <p className="text-muted-foreground text-center">No se encontraron choferes.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const runtime = 'edge';
