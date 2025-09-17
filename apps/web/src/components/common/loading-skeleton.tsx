import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  const statKeys = ['stat-1', 'stat-2', 'stat-3', 'stat-4'];
  const listItemKeys = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];

  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statKeys.map((key) => (
          <div key={key} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          {listItemKeys.map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `row-${i}`);
  const colKeys = Array.from({ length: columns }, (_, i) => `col-${i}`);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex space-x-4">
        {colKeys.map((colKey) => (
          <Skeleton key={`header-${colKey}`} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {rowKeys.map((rowKey) => (
        <div key={rowKey} className="flex space-x-4">
          {colKeys.map((colKey) => (
            <Skeleton key={`${rowKey}-${colKey}`} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
