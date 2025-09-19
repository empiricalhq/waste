import { AddSupervisorDialog } from '@/components/supervisors/add-supervisor-dialog';
import { SupervisorActions } from '@/components/supervisors/supervisor-actions';
import { Card, CardContent } from '@/components/ui/card';
import { getSupervisors } from '@/features/supervisors/actions';

export default async function SupervisorsPage() {
  const supervisors = await getSupervisors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de supervisores</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Administra los supervisores del sistema</p>
          <AddSupervisorDialog />
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {supervisors.map((supervisor) => (
              <div key={supervisor.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium">{supervisor.name}</p>
                  <p className="text-muted-foreground text-xs">{supervisor.email}</p>
                </div>
                <SupervisorActions supervisor={supervisor} />
              </div>
            ))}
            {supervisors.length === 0 && (
              <p className="text-muted-foreground text-center">No se encontraron supervisores.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const runtime = 'edge';
