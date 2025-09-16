'use client';

import dynamic from 'next/dynamic';

// Asumimos que el tipo Truck está definido en otro lugar y lo importamos
type Truck = {
  id: string;
  license_plate: string;
  lat: number | null;
  lng: number | null;
};

// El MapWrapper ahora acepta la lista de camiones
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
