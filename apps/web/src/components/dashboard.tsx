"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MapPin, Clock } from "lucide-react"
import { AddDriverModal } from "@/components/add-driver-modal"
// Update the import path to the correct location of SignOutButton
import SignOutButton from "../app/(routes)/(auth)/components/button-signout";

// Datos de ejemplo simples
const mockDrivers = [
  {
    id: 1,
    name: "Juan Pérez",
    phone: "+1234567890",
    status: "active",
    location: "Centro, Ciudad",
    lastUpdate: "Hace 5 min",
  },
  {
    id: 2,
    name: "María García",
    phone: "+1234567891",
    status: "inactive",
    location: "Norte, Ciudad",
    lastUpdate: "Hace 2 horas",
  },
  {
    id: 3,
    name: "Carlos López",
    phone: "+1234567892",
    status: "active",
    location: "Sur, Ciudad",
    lastUpdate: "Hace 1 min",
  },
]

export function SimpleDashboard() {
  const [drivers, setDrivers] = useState(mockDrivers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredDrivers = drivers.filter((driver) => driver.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const addDriver = (newDriver: { name: string; phone: string }) => {
    const driver = {
      id: drivers.length + 1,
      ...newDriver,
      status: "active" as const,
      location: "Sin ubicación",
      lastUpdate: "Ahora",
    }
    setDrivers([...drivers, driver])
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de choferes</h1>
            <p className="text-muted-foreground">Gestiona tu flota de choferes</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar chofer
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar choferes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Choferes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {drivers.filter((d) => d.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {drivers.filter((d) => d.status === "inactive").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drivers List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Choferes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">{driver.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{driver.name}</h3>
                      <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {driver.location}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {driver.lastUpdate}
                      </div>
                    </div>
                    <Badge variant={driver.status === "active" ? "default" : "secondary"}>
                      {driver.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AddDriverModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addDriver} />
      </div>
      {/* agrega como footer un botón que permita hacer logout */}
      <footer className="flex justify-end p-4">
        <SignOutButton />
      </footer>
    </>
  )
}