import { cookies } from 'next/headers';
import { AddUserButton } from '@/components/dashboard/add-user-button';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';
import MapWrapper from '@/components/map/map-wrapper';

// biome-ignore lint: cloudflare requires edge runtime
export const runtime = 'edge';

// Asumimos estos tipos basados en las respuestas de la API
type Truck = {
  id: string;
  license_plate: string;
  lat: number | null;
  lng: number | null /* ... */;
};
type Route = { id: string; status: string /* ... */ };
type Issue = { id: string; status: string /* ... */ };
type Alert = {
  id: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low' /* ... */;
};

async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('better-auth.session_token');
  if (!token) {
    throw new Error('No auth token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    Cookie: `${token.name}=${token.value}`,
  };
  const [trucksRes, routesRes, issuesRes, alertsRes] = await Promise.all([
    fetch('http://localhost:4000/api/admin/trucks', {
      headers,
      cache: 'no-store',
    }),
    fetch('http://localhost:4000/api/admin/routes', {
      headers,
      cache: 'no-store',
    }),
    fetch('http://localhost:4000/api/admin/issues', {
      headers,
      cache: 'no-store',
    }),
    fetch('http://localhost:4000/api/admin/alerts', {
      headers,
      cache: 'no-store',
    }),
  ]);

  const trucks: Truck[] = trucksRes.ok ? await trucksRes.json() : [];
  const routes: Route[] = routesRes.ok ? await routesRes.json() : [];
  const issues: Issue[] = issuesRes.ok ? await issuesRes.json() : [];
  const alerts: Alert[] = alertsRes.ok ? await alertsRes.json() : [];

  const MaxRecentAlerts = 5;

  const activeRoutesCount = routes.filter((r) => r.status === 'active').length;
  const openIssuesCount = issues.filter((i) => i.status === 'open').length;
  const recentAlerts = alerts.slice(0, MaxRecentAlerts);

  return {
    trucks,
    activeRoutesCount,
    openIssuesCount,
    alertsCount: alerts.length,
    recentAlerts,
  };
}

export default async function DashboardPage() {
  const { trucks, activeRoutesCount, openIssuesCount, alertsCount, recentAlerts } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vista general del sistema en tiempo real.</p>
        </div>
        <AddUserButton />
      </div>

      <DashboardStats activeRoutes={activeRoutesCount} openIssues={openIssuesCount} totalAlerts={alertsCount} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[500px] w-full rounded-lg border lg:col-span-2">
          {/* Pasamos los datos de los camiones al MapWrapper */}
          <MapWrapper trucks={trucks} />
        </div>
        <div className="h-[500px]">
          {/* Usamos el nuevo componente de alertas */}
          <RecentAlerts alerts={recentAlerts} />
        </div>
      </div>
    </div>
  );
}
