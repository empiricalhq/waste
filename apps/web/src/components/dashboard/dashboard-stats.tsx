import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, AlertTriangle, Siren } from "lucide-react";

interface DashboardStatsProps {
  activeRoutes: number;
  openIssues: number;
  totalAlerts: number;
}

export function DashboardStats({
  activeRoutes,
  openIssues,
  totalAlerts,
}: DashboardStatsProps) {
  const stats = [
    { title: "Rutas Activas", value: activeRoutes, icon: Route },
    { title: "Incidencias Abiertas", value: openIssues, icon: AlertTriangle },
    { title: "Alertas Hoy", value: totalAlerts, icon: Siren },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
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
