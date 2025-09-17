import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrucks } from '@/features/trucks/actions';

export const runtime = 'edge';

export default async function TrucksPage() {
  const trucks = await getTrucks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Truck Management</h1>
        <p className="text-muted-foreground">View and manage the vehicle fleet.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Truck List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trucks.map((truck) => (
              <div key={truck.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <div>
                  <p className="font-medium">{truck.name}</p>
                  <p className="text-muted-foreground text-xs">{truck.licensePlate}</p>
                </div>
                <Badge variant={truck.isActive ? 'default' : 'secondary'}>
                  {truck.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
            {trucks.length === 0 && <p className="text-muted-foreground text-center">No trucks found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
