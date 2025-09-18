'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Truck } from '@/lib/api-contract';

interface LiveMapProps {
  trucks?: Truck[];
}

// Default map constants
const X_COORDINATE = -77.0428;
const Y_COORDINATE = -12.0464;
const DEFAULT_CENTER: [number, number] = [Y_COORDINATE, X_COORDINATE]; // Lima, Peru
const DEFAULT_ZOOM = 12;

// Marker icon config
const ICON_SIZE = { width: 25, height: 41 };
const ICON_ANCHOR = { x: 12, y: 41 };
const POPUP_ANCHOR = { x: 1, y: -34 };
const SHADOW_SIZE = { width: 41, height: 41 };

export default function LiveMap({ trucks = [] }: LiveMapProps) {
  const icon = L.icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [ICON_SIZE.width, ICON_SIZE.height],
    iconAnchor: [ICON_ANCHOR.x, ICON_ANCHOR.y],
    popupAnchor: [POPUP_ANCHOR.x, POPUP_ANCHOR.y],
    shadowSize: [SHADOW_SIZE.width, SHADOW_SIZE.height],
  });

  const trucksWithLocation = trucks.filter(
    (t): t is Truck & { lat: number; lng: number } => t.lat != null && t.lng != null,
  );

  const center: [number, number] =
    trucksWithLocation.length > 0 ? [trucksWithLocation[0].lat, trucksWithLocation[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer center={center} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {trucksWithLocation.map((truck) => (
        <Marker key={truck.id} position={[truck.lat, truck.lng]} icon={icon}>
          <Popup>
            <strong>Placa:</strong> {truck.license_plate}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
