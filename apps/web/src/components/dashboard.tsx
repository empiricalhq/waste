"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Clock } from "lucide-react";
import { AddDriverModal } from "@/components/add-driver-modal";
// Update the import path to the correct location of SignOutButton
import SignOutButton from "../app/(routes)/(auth)/components/button-signout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";

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
];

export function SimpleDashboard() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addDriver = (newDriver: { name: string; phone: string }) => {
    const driver = {
      id: drivers.length + 1,
      ...newDriver,
      status: "active" as const,
      location: "Sin ubicación",
      lastUpdate: "Ahora",
    };
    setDrivers([...drivers, driver]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de gestión de usuarios
        </p>
      </div>

      <DashboardStats />
      <RecentActivity />
    </div>
  );
}
