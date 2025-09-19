import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { DashboardSkeleton } from '@/components/common/loading-skeleton';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentIssues } from '@/components/dashboard/recent-issues';
import { MapWrapper } from '@/components/map/map-wrapper';
import { getDashboardData } from '@/features/dashboard/actions';

async function DashboardContent() {
  const data = await getDashboardData();

  return (
    <>
      <DashboardStats activeRoutes={data.activeRoutesCount} openIssues={data.openIssuesCount} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="isolate h-[500px] w-full rounded-lg border lg:col-span-2">
          <ErrorBoundary fallback={<div className="flex h-full items-center justify-center">Failed to load map</div>}>
            <MapWrapper trucks={data.trucks} />
          </ErrorBoundary>
        </div>
        <div className="h-[500px]">
          <RecentIssues issues={data.recentIssues} />
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vista general del sistema en tiempo real</p>
        </div>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export const runtime = 'edge';
