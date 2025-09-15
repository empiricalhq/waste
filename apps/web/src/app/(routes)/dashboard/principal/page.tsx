import { AddUserButton } from '@/components/dashboard/add-user-button';
// Se elimina la importación de DashboardSidebar ya que el layout se encarga de ella.
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import MapWrapper from '@/components/map/map-wrapper';

export default async function DashboardPage() {
  return (
    // Se elimina la estructura del layout (Sidebar, pl-64, main)
    // y se deja solo el contenido de la página.
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Sistema de gestión de administradores, supervisores y choferes</p>
        </div>
        <AddUserButton />
      </div>

      <DashboardStats />
      <div className="mt-6">
        <RecentActivity />
      </div>
      <div className="mt-6">
        <MapWrapper />
      </div>
    </div>
  );
}
