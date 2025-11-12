export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/v1";
export const API_TIMEOUT = 15000;
export const TOKEN_KEY = "authToken";

export const ROUTES = {
  LOGIN: "/(auth)/login",
  SIGN_UP: "/(auth)/sign-up",
  HOME: "/(tabs)",
  SCHEDULE: "/(tabs)/schedule",
  TRUCK_MAP: "/truck-map",
} as const;

export const WASTE_TYPES = {
  general: { label: "Generales", color: "#666666" },
  recycling: { label: "Reciclaje", color: "#3B82F6" },
  organic: { label: "Orgánico", color: "#10B981" },
  hazardous: { label: "Peligroso", color: "#EF4444" },
} as const;

export const QUERY_KEYS = {
  USER: "user",
  COLLECTIONS: "collections",
  TRUCKS: "trucks",
  REPORTS: "reports",
  REPORT_TYPES: "reportTypes",
  QUIZ: "quiz",
} as const;
