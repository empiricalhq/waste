import { Suspense } from 'react';
import { getDashboardData } from '@/actions/dashboard';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { DashboardSkeleton } from '@/components/common/loading-skeleton';
import { AddUserButton } from '@/components/dashboard/add-user-button';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';
import { MapWrapper } from '@/components/map/map-wrapper';

// Remove edge runtime - not needed for this page
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vista general del sistema en tiempo real.</p>
        </div>
        <AddUserButton />
      </div>

      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

async function DashboardContent() {
  const { vehicles, activeRoutesCount, openIssuesCount, alertsCount, recentAlerts } = await getDashboardData();

  return (
    <>
      <DashboardStats
        totalVehicles={vehicles.length}
        activeRoutes={activeRoutesCount}
        openIssues={openIssuesCount}
        totalAlerts={alertsCount}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[500px] w-full rounded-lg border lg:col-span-2">
          <ErrorBoundary fallback={<div className="flex items-center justify-center h-full">Failed to load map</div>}>
            <MapWrapper vehicles={vehicles} />
          </ErrorBoundary>
        </div>
        <div className="h-[500px]">
          <RecentAlerts alerts={recentAlerts} />
        </div>
      </div>
    </>
  );
}
