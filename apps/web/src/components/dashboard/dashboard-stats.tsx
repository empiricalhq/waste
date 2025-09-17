import { AlertTriangle, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatsProps {
  activeRoutes: number;
  openIssues: number;
}

export function DashboardStats({ activeRoutes, openIssues }: DashboardStatsProps) {
  const stats = [
    { title: 'Rutas activas', value: activeRoutes, icon: Route },
    { title: 'Incidencias abiertas', value: openIssues, icon: AlertTriangle },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
