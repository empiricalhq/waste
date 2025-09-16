import { cookies } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const runtime = 'edge';

interface Driver {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  alert: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  active: 'Activo',
  completed: 'Completado',
  alert: 'Alerta',
  inactive: 'Inactivo',
};

export default async function ChoferesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('better-auth.session_token');
  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch('http://localhost:4000/api/admin/drivers', {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${token.name}=${token?.value}`,
    },
  });

  const data = await response.json();

  return (
    <div>
      <main>
        <h1 className="text-2xl font-bold">Gestión de choferes</h1>
        <p className="text-muted-foreground">Administra los choferes de la flota</p>
        <Card className="mt-4">
          <CardContent>
            <div className="space-y-4">
              {data.map((driver: Driver) => {
                const statusKey = driver.isActive ? 'active' : 'inactive';
                return (
                  <div key={driver.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-foreground font-medium">{driver.name}</p>
                          <p className="text-muted-foreground text-xs">{driver.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={statusColors[statusKey]}>{statusLabels[statusKey]}</Badge>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(driver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
