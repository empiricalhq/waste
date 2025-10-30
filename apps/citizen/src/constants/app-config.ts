import Constants from "expo-constants";

export const APP_CONFIG = {
  API_URL: Constants.expoConfig?.extra?.API_URL ?? "http://localhost:8000/v1",
  API_TIMEOUT: 15000,
  RETRY_ATTEMPTS: 2,
  STORAGE_TOKEN_KEY: "authToken",
} as const;

export const ROUTES = {
  LOGIN: "/(auth)/login",
  SIGN_UP: "/(auth)/sign-up",
  HOME: "/(tabs)",
  SCHEDULE: "/(tabs)/schedule",
  TRUCK_MAP: "/truck-map",
  HELP: "/help",
  PRIVACY: "/privacy",
  TERMS: "/terms",
} as const;
