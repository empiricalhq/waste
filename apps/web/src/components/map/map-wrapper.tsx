'use client';

import dynamic from 'next/dynamic';
import type { Truck } from '@/db/types';

// El MapWrapper ahora acepta la lista de camiones con ubicación
interface MapWrapperProps {
  trucks: Truck[];
}

const LiveMap = dynamic(() => import('@/components/map/live-map'), {
  ssr: false,
  loading: () => (
    <div className="bg-secondary flex h-full items-center justify-center">
      <p>Cargando mapa...</p>
    </div>
  ),
});

export function MapWrapper({ trucks }: MapWrapperProps) {
  // Pasamos la lista de camiones al componente LiveMap
  return <LiveMap trucks={trucks} />;
}
