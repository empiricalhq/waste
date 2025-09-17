import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDrivers } from '@/features/drivers/actions';

export const runtime = 'edge';

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <p className="text-muted-foreground">View and manage all drivers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-muted-foreground text-xs">{driver.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={driver.isActive ? 'default' : 'secondary'}>
                    {driver.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    Joined: {new Date(driver.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {drivers.length === 0 && <p className="text-muted-foreground text-center">No drivers found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
