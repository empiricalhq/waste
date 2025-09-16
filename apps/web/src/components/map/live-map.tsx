'use client';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Truck = {
  id: string;
  license_plate: string;
  lat: number | null;
  lng: number | null;
};

interface LiveMapProps {
  trucks?: Truck[];
}

export default function LiveMap({ trucks = [] }: LiveMapProps) {
  const icon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const trucksWithLocation = trucks.filter(
    (t) => t.lat != null && t.lng != null,
  );
  const center: [number, number] =
    trucksWithLocation.length > 0
      ? [trucksWithLocation[0].lat!, trucksWithLocation[0].lng!]
      : [-12.046, -77.042];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {trucksWithLocation.map((truck) => (
        <Marker key={truck.id} position={[truck.lat!, truck.lng!]} icon={icon}>
          <Popup>
            <strong>Placa:</strong> {truck.license_plate}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
