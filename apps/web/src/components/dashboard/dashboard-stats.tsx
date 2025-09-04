import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Truck, MapPin, AlertTriangle } from "lucide-react"

const stats = [
  {
    title: "Total Choferes",
    value: "24",
    change: "+2 este mes",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Choferes Activos",
    value: "18",
    change: "75% del total",
    icon: Truck,
    color: "text-green-600",
  },
  {
    title: "En Ruta",
    value: "12",
    change: "67% activos",
    icon: MapPin,
    color: "text-orange-600",
  },
  {
    title: "Alertas",
    value: "3",
    change: "Requieren atención",
    icon: AlertTriangle,
    color: "text-red-600",
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
