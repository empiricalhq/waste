import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    driver: "Carlos Mendoza",
    action: "Inició ruta",
    location: "Depot Central → Cliente ABC",
    time: "Hace 15 min",
    status: "active",
  },
  {
    id: 2,
    driver: "Ana García",
    action: "Completó entrega",
    location: "Cliente XYZ",
    time: "Hace 32 min",
    status: "completed",
  },
  {
    id: 3,
    driver: "Luis Rodríguez",
    action: "Reportó incidente",
    location: "Ruta 45, Km 23",
    time: "Hace 1 hora",
    status: "alert",
  },
  {
    id: 4,
    driver: "María López",
    action: "Finalizó turno",
    location: "Depot Norte",
    time: "Hace 2 horas",
    status: "inactive",
  },
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  alert: "bg-red-100 text-red-800",
  inactive: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  active: "Activo",
  completed: "Completado",
  alert: "Alerta",
  inactive: "Inactivo",
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-foreground font-medium">
                      {activity.driver}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {activity.action}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {activity.location}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  className={
                    statusColors[activity.status as keyof typeof statusColors]
                  }
                >
                  {statusLabels[activity.status as keyof typeof statusLabels]}
                </Badge>
                <span className="text-muted-foreground whitespace-nowrap text-xs">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
