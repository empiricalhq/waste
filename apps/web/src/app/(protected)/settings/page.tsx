import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth, requireUser } from '@/features/auth/lib';
import { SETTINGS_ROLES } from '@/features/auth/roles';
import { AddUserButton } from '@/components/dashboard/add-user-button';

export default async function SettingsPage() {
  await requireUser();

  const auth = await getAuth();
  const userRoles = auth?.user?.role?.split(',') ?? [];

  const hasSettingsAccess = SETTINGS_ROLES.some((settingRole) => userRoles.includes(settingRole));

  if (!hasSettingsAccess) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Ajustes del sistema, usuarios y roles</p>
        </div>
        <AddUserButton />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aquí irá la tabla o lista para crear, editar y desactivar usuarios.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles y permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí irá la interfaz para definir los roles (admin, supervisor) y sus permisos.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Preferencias generales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí irán otros ajustes como preferencias de notificación, integraciones, etc.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const runtime = 'edge';
