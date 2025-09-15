"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function InteractiveMap() {
  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[40.7128, -74.006]}>
        <Popup>Un marcador en Nueva York</Popup>
      </Marker>
    </MapContainer>
  );
}
