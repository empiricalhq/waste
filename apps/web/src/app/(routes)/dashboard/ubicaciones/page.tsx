import { cookies } from 'next/headers';
import { type Route, RoutesTable } from '@/components/dashboard/routes-table';

// biome-ignore lint: cloudflare requires edge runtime
export const runtime = 'edge';

async function getRoutes(): Promise<Route[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('better-auth.session_token');

  if (!token) {
    return [];
  }

  try {
    // Asumimos que el endpoint para las rutas es /api/admin/routes
    const response = await fetch('http://localhost:4000/api/admin/routes', {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${token.name}=${token.value}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (_error) {
    return [];
  }
}

export default async function RutasPage() {
  const routes = await getRoutes();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Rutas</h1>
        <p className="text-muted-foreground">Administra las rutas de recolección y sus puntos de paso (waypoints).</p>
      </div>
      <RoutesTable initialRoutes={routes} />
    </div>
  );
}
