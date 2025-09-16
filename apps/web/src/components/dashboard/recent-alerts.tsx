import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Alert = {
  id: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
};

const severityClasses = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-blue-500',
};

export function RecentAlerts({ alerts }: { alerts: Alert[] }) {
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
                <Bell className={`mt-1 h-5 w-5 ${severityClasses[alert.severity]}`} />
                <div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-muted-foreground text-sm">{new Date(alert.timestamp).toLocaleTimeString()}</p>
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
