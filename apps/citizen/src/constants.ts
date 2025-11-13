export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://lima-api.vercel.app";

export const CONFIG = {
  api: {
    timeout: 15_000,
    retryAttempts: 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  location: {
    timeout: 10_000,
    minAccuracy: 100,
  },
  polling: {
    trucks: 60_000, // 1 minute
    collections: 5 * 60 * 1000, // 5 minutes
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  PENDING_REPORTS: "pendingReports",
  USER_LOCATION: "userLocation",
} as const;

export const ROUTES = {
  LOGIN: "/(auth)/login" as const,
  SIGN_UP: "/(auth)/sign-up" as const,
  HOME: "/(tabs)" as const,
} as const;

export const WASTE_TYPES = {
  general: { label: "Basura General", color: "#71717A" },
  recycling: { label: "Reciclables", color: "#3B82F6" },
  organic: { label: "Orgánicos", color: "#10B981" },
  hazardous: { label: "Peligrosos", color: "#EF4444" },
} as const;

export const QUERY_KEYS = {
  USER: "user",
  COLLECTIONS: "collections",
  TRUCKS: "trucks",
  TRUCKS_LOCATIONS: "trucks-locations",
  REPORTS: "reports",
  REPORT_TYPES: "reportTypes",
  QUIZ: "quiz",
} as const;

export const ERROR_MESSAGES = {
  NETWORK: "Sin conexión a internet",
  TIMEOUT: "La solicitud tardó demasiado",
  AUTH_REQUIRED: "Debes iniciar sesión",
  LOCATION_DENIED: "Permiso de ubicación denegado",
  LOCATION_UNAVAILABLE: "No se pudo obtener la ubicación",
  GENERIC: "Ocurrió un error inesperado",
} as const;
