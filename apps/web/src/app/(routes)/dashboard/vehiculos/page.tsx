import { cookies } from 'next/headers';
import { type Truck, VehiclesTable } from '@/components/dashboard/vehicles-table';

export const runtime = 'edge';

async function getTrucks(): Promise<Truck[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('better-auth.session_token');

  if (!token) {
    console.error('No auth token found');
    return [];
  }

  try {
    const response = await fetch('http://localhost:4000/api/admin/trucks', {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${token.name}=${token.value}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trucks: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function VehiculosPage() {
  const trucks = await getTrucks();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestión de Vehículos</h1>
        <p className="text-muted-foreground">Administra la flota de vehículos y sus conductores asignados.</p>
      </div>
      <VehiclesTable initialVehicles={trucks} />
    </div>
  );
}
