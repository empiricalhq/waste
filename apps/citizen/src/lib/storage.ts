import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AuthTokens, QuizProgress, User } from "@/types";

const KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  QUIZ_PROGRESS: "quiz_progress",
} as const;

/**
 * Secure storage wrapper that uses SecureStore on native platforms
 * and AsyncStorage on web (for development).
 */
class SecureStorage {
  private async setSecure(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  private async getSecure(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  }

  private async deleteSecure(key: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  // Auth tokens (secure)
  async getAuthTokens(): Promise<AuthTokens | null> {
    try {
      const data = await this.getSecure(KEYS.AUTH_TOKEN);
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data) as AuthTokens;

      // Validate structure
      if (!parsed.token || typeof parsed.expiresAt !== "number") {
        console.warn("Invalid token structure, clearing auth");
        await this.clearAuth();
        return null;
      }

      // Check if expired
      if (Date.now() >= parsed.expiresAt) {
        console.info("Token expired, clearing auth");
        await this.clearAuth();
        return null;
      }

      return parsed;
    } catch (e) {
      console.error("Failed to get auth tokens from storage", e);
      await this.clearAuth(); // Clear corrupted data
      return null;
    }
  }

  async setAuthTokens(tokens: AuthTokens): Promise<void> {
    try {
      await this.setSecure(KEYS.AUTH_TOKEN, JSON.stringify(tokens));
    } catch (e) {
      console.error("Failed to set auth tokens in storage", e);
      throw new Error("No se pudo guardar la sesión");
    }
  }

  // User data (non-sensitive, can use AsyncStorage)
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data) as User;

      // Validate structure
      if (!(parsed.id && parsed.email && parsed.name)) {
        console.warn("Invalid user structure, clearing");
        await AsyncStorage.removeItem(KEYS.USER);
        return null;
      }

      return parsed;
    } catch (e) {
      console.error("Failed to get user from storage", e);
      await AsyncStorage.removeItem(KEYS.USER);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to set user in storage", e);
      throw new Error("No se pudo guardar el usuario");
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        this.deleteSecure(KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(KEYS.USER),
      ]);
    } catch (e) {
      console.error("Failed to clear auth from storage", e);
    }
  }

  // Quiz progress (local only)
  async getQuizProgress(): Promise<QuizProgress> {
    const defaultValue: QuizProgress = {
      streak: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      lastPlayed: null,
    };

    try {
      const data = await AsyncStorage.getItem(KEYS.QUIZ_PROGRESS);
      if (!data) {
        return defaultValue;
      }

      const parsed = JSON.parse(data) as QuizProgress;

      // Validate structure
      if (
        typeof parsed.streak !== "number" ||
        typeof parsed.totalAnswered !== "number" ||
        typeof parsed.correctAnswers !== "number"
      ) {
        console.warn("Invalid quiz progress structure, resetting");
        return defaultValue;
      }

      return parsed;
    } catch (e) {
      console.error("Failed to get quiz progress from storage", e);
      // Try to recover by resetting
      await this.setQuizProgress(defaultValue);
      return defaultValue;
    }
  }

  async setQuizProgress(progress: QuizProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to set quiz progress in storage", e);
      throw new Error("No se pudo guardar el progreso");
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        this.clearAuth(),
        AsyncStorage.removeItem(KEYS.QUIZ_PROGRESS),
      ]);
    } catch (e) {
      console.error("Failed to clear all data", e);
    }
  }
}

export const storage = new SecureStorage();
