import * as SecureStore from "expo-secure-store";
import { APP_CONFIG } from "@/constants/app-config";

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(APP_CONFIG.STORAGE_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(APP_CONFIG.STORAGE_TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_TOKEN_KEY);
}
