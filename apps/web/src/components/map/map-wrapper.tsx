'use client';

import dynamic from 'next/dynamic';
import type { Truck } from '@/lib/api-contract';

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
  return <LiveMap trucks={trucks} />;
}
