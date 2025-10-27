import { AddRouteDialog } from '@/components/routes/add-route-dialog';
import { DeleteRouteButton } from '@/components/routes/delete-route-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getRoutes } from '@/features/routes/actions';

function getStatusInfo(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Activa', variant: 'default' as const };
    case 'inactive':
      return { label: 'Inactiva', variant: 'secondary' as const };
    case 'draft':
      return { label: 'Borrador', variant: 'outline' as const };
    default:
      return { label: status, variant: 'outline' as const };
  }
}

export default async function RoutesPage() {
  const routes = await getRoutes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de rutas</h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Administra las rutas de recolección y sus puntos de recorrido
          </p>
          <AddRouteDialog />
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route) => {
              const status = getStatusInfo(route.status);
              return (
                <div key={route.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{route.name}</p>
                      {route.description && (
                        <p className="text-muted-foreground text-sm">{route.description}</p>
                      )}
                      {typeof route.waypoint_count === 'number' && (
                        <p className="text-muted-foreground text-xs">
                          {route.waypoint_count} punto(s) registrados
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <DeleteRouteButton routeId={route.id} routeName={route.name} />
                    </div>
                  </div>
                </div>
              );
            })}
            {routes.length === 0 && (
              <p className="text-muted-foreground text-center">No se encontraron rutas.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const runtime = 'edge';
