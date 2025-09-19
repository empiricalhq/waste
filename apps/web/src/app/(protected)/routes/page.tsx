import { AddRouteDialog } from '@/components/routes/add-route-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getRoutes } from '@/features/routes/actions';

export default async function RoutesPage() {
  const routes = await getRoutes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de rutas</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Administra las rutas de recolección y sus puntos de recorrido</p>
          <AddRouteDialog />
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <div>
                  <p className="font-medium">{route.name}</p>
                  <p className="text-muted-foreground text-xs">{route.description}</p>
                </div>
                <Badge>{route.status}</Badge>
              </div>
            ))}
            {routes.length === 0 && <p className="text-muted-foreground text-center">No se encontraron rutas.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const runtime = 'edge';
