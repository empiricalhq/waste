'use client';

import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('./live-map.tsx'), {
  ssr: false,
});

export default function MapWrapper() {
  return <LiveMap />;
}
