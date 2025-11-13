import type { WasteType } from "./types";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://lima-api.vercel.app";

export const WASTE_TYPES: Record<WasteType, { label: string; color: string }> =
  {
    general: { label: "Basura General", color: "#71717A" },
    recycling: { label: "Reciclables", color: "#3B82F6" },
    organic: { label: "Orgánicos", color: "#10B981" },
    hazardous: { label: "Peligrosos", color: "#EF4444" },
  };

export const REPORT_TYPES = {
  missed_collection: "Recolección perdida",
  illegal_dumping: "Vertido ilegal",
  other: "Otro",
} as const;

// polling intervals (ms)
export const POLLING = {
  TRUCKS: 30_000, // 30s when visible
  STATUS: 60_000, // 1min when visible
} as const;

// map defaults
export const DEFAULT_MAP_CENTER = {
  latitude: -12.0464,
  longitude: -77.0428,
  zoom: 12,
} as const;
