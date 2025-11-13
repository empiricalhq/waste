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

// Polling intervals (ms) - Increased for battery optimization
export const POLLING = {
  TRUCKS: 5 * 60 * 1000, // 5 minutes
  STATUS: 5 * 60 * 1000, // 5 minutes
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 30_000,
} as const;

// Token expiry buffer - refresh 5 minutes before expiry
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

// Map defaults
export const DEFAULT_MAP_CENTER = {
  latitude: -12.0464,
  longitude: -77.0428,
  zoom: 12,
} as const;

// Toast configuration
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 3000,
  MAX_VISIBLE_TOASTS: 3,
  STACK_OFFSET: 8,
  ANIMATION_DURATION: 200,
} as const;
