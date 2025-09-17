import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SystemAlert } from '@/db/types';

const typeClasses = {
  route_deviation: 'text-red-500',
  prolonged_stop: 'text-yellow-500',
  late_start: 'text-blue-500',
};

export function RecentAlerts({ alerts }: { alerts: SystemAlert[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alertas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-4">
                <Bell className={`mt-1 h-5 w-5 ${typeClasses[alert.type]}`} />
                <div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-muted-foreground text-sm">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No hay alertas recientes.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
