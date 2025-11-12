import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { APP_CONFIG } from "@/constants/app-config";

export async function saveToken(token: string): Promise<void> {
  await setItemAsync(APP_CONFIG.STORAGE_TOKEN_KEY, token);
}

export function getToken(): Promise<string | null> {
  return getItemAsync(APP_CONFIG.STORAGE_TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await deleteItemAsync(APP_CONFIG.STORAGE_TOKEN_KEY);
}
