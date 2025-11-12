import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { STORAGE_KEYS } from "@/constants";
import type { LocationCoords, PendingReport } from "@/types";

class StorageService {
  async getToken(): Promise<string | null> {
    try {
      return await getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    await setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async removeToken(): Promise<void> {
    await deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }

  // asyncStorage for non-sensitive data
  async getPendingReports(): Promise<PendingReport[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async setPendingReports(reports: PendingReport[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_REPORTS,
      JSON.stringify(reports),
    );
  }

  async addPendingReport(report: PendingReport): Promise<void> {
    const reports = await this.getPendingReports();
    reports.push(report);
    await this.setPendingReports(reports);
  }

  async removePendingReport(id: string): Promise<void> {
    const reports = await this.getPendingReports();
    const filtered = reports.filter((r) => r.id !== id);
    await this.setPendingReports(filtered);
  }

  async getLastLocation(): Promise<LocationCoords | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOCATION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setLastLocation(coords: LocationCoords): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_LOCATION,
      JSON.stringify(coords),
    );
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      AsyncStorage.multiRemove([
        STORAGE_KEYS.PENDING_REPORTS,
        STORAGE_KEYS.USER_LOCATION,
      ]),
    ]);
  }
}

export const storage = new StorageService();
