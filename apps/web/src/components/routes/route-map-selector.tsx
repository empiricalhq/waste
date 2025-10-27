"use client";

import { useEffect, useMemo, useState } from "react";
import L, { type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvent } from "react-leaflet";
import { cn } from "@/lib/utils";

type Coordinate = { lat: number; lng: number };

export type WaypointCoordinate = Coordinate & { sequence_order: number; index: number };

interface RouteMapSelectorProps {
  startPosition: Coordinate | null;
  waypoints: WaypointCoordinate[];
  onSelectStart: (position: Coordinate) => void;
  onAddWaypoint: (position: Coordinate) => void;
  onMoveWaypoint: (index: number, position: Coordinate) => void;
  height?: number | string;
  className?: string;
}

const DEFAULT_CENTER: Coordinate = { lat: -12.0464, lng: -77.0428 }; // Lima, Peru
const DEFAULT_ZOOM = 12;
const DEFAULT_HEIGHT: number | string = 420;

const ICON_SIZE = { width: 25, height: 41 };
const ICON_ANCHOR = { x: 12, y: 41 };
const POPUP_ANCHOR = { x: 1, y: -34 };
const SHADOW_SIZE = { width: 41, height: 41 };

function MapCenterUpdater({ position }: { position: Coordinate | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }
  }, [map, position]);

  return null;
}

function MapClickHandler({ onClick }: { onClick: (event: LeafletMouseEvent) => void }) {
  useMapEvent("click", onClick);
  return null;
}

function MapResizeHandler({
  height,
  startPosition,
  waypointsCount,
}: {
  height: string;
  startPosition: Coordinate | null;
  waypointsCount: number;
}) {
  const map = useMap();

  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
    }, 50);
    return () => clearTimeout(id);
  }, [map]);

  useEffect(() => {
    map.invalidateSize();
  }, [map, height, startPosition?.lat, startPosition?.lng, waypointsCount]);

  return null;
}

export function RouteMapSelector({
  startPosition,
  waypoints,
  onSelectStart,
  onAddWaypoint,
  onMoveWaypoint,
  height = DEFAULT_HEIGHT,
  className,
}: RouteMapSelectorProps) {
  const [mode, setMode] = useState<"start" | "waypoint">(() => (startPosition ? "waypoint" : "start"));

  useEffect(() => {
    if (!startPosition) {
      setMode("start");
    }
  }, [startPosition]);

  const icon = useMemo(
    () =>
      L.icon({
        iconUrl: "/marker-icon.png",
        iconRetinaUrl: "/marker-icon-2x.png",
        shadowUrl: "/marker-shadow.png",
        iconSize: [ICON_SIZE.width, ICON_SIZE.height],
        iconAnchor: [ICON_ANCHOR.x, ICON_ANCHOR.y],
        popupAnchor: [POPUP_ANCHOR.x, POPUP_ANCHOR.y],
        shadowSize: [SHADOW_SIZE.width, SHADOW_SIZE.height],
      }),
    [],
  );

  const orderedWaypoints = useMemo(
    () => [...waypoints].sort((a, b) => a.sequence_order - b.sequence_order),
    [waypoints],
  );

  const polylinePositions = useMemo(() => {
    const points: Coordinate[] = [];
    if (startPosition) {
      points.push(startPosition);
    }
    orderedWaypoints.forEach((waypoint) => {
      points.push({ lat: waypoint.lat, lng: waypoint.lng });
    });
    return points.map(({ lat, lng }) => [lat, lng]) as [number, number][];
  }, [orderedWaypoints, startPosition]);

  const handleMapClick = (event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    if (mode === "start") {
      onSelectStart({ lat, lng });
      setMode("waypoint");
      return;
    }
    onAddWaypoint({ lat, lng });
  };

  const activeCenter = startPosition ?? orderedWaypoints[0] ?? DEFAULT_CENTER;

  const mapInstructions =
    mode === "start"
      ? "Selecciona el punto inicial haciendo clic en el mapa."
      : "Haz clic en el mapa para añadir un nuevo punto del recorrido.";

  const mapHeight = useMemo(() => (typeof height === "number" ? `${height}px` : height), [height]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">{mapInstructions}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("start")}
            className={cn(
              "rounded-md border px-3 py-1 text-sm transition",
              mode === "start" ? "border-primary text-primary" : "border-input text-muted-foreground",
            )}
          >
            Elegir inicio
          </button>
          <button
            type="button"
            onClick={() => setMode("waypoint")}
            className={cn(
              "rounded-md border px-3 py-1 text-sm transition",
              mode === "waypoint" ? "border-primary text-primary" : "border-input text-muted-foreground",
            )}
          >
            Añadir punto
          </button>
        </div>
      </div>
      <div className="rounded-md overflow-hidden border">
        <MapContainer
          center={[activeCenter.lat, activeCenter.lng]}
          zoom={DEFAULT_ZOOM}
          style={{ height: mapHeight, width: "100%" }}
        >
          <MapCenterUpdater position={activeCenter} />
          <MapClickHandler onClick={handleMapClick} />
          <MapResizeHandler
            height={mapHeight}
            startPosition={startPosition}
            waypointsCount={orderedWaypoints.length}
          />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {polylinePositions.length > 1 && <Polyline positions={polylinePositions} color="#2563eb" />}
          {startPosition && (
            <Marker
              position={[startPosition.lat, startPosition.lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const { lat, lng } = marker.getLatLng();
                  onSelectStart({ lat, lng });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -16]} permanent>
                Inicio
              </Tooltip>
            </Marker>
          )}
          {orderedWaypoints.map((waypoint) => (
            <Marker
              key={`${waypoint.sequence_order}-${waypoint.index}`}
              position={[waypoint.lat, waypoint.lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const { lat, lng } = marker.getLatLng();
                  onMoveWaypoint(waypoint.index, { lat, lng });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -16]} permanent>
                Punto {waypoint.sequence_order}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
