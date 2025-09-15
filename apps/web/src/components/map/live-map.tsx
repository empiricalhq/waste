"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function InteractiveMap() {
  return (
    <MapContainer
      center={[-12.02, -77.12]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[-12.02, -77.12]}>
        <Popup>Un marcador en Lima</Popup>
      </Marker>
    </MapContainer>
  );
}
