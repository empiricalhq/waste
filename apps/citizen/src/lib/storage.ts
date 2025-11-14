import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import type { AuthTokens, QuizProgress, User } from "@/types";

const KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  QUIZ_PROGRESS: "quiz_progress",
} as const;

/**
 * Secure storage wrapper that uses SecureStore on native platforms.
 */
class Storage {
  private async set(key: string, value: unknown): Promise<void> {
    await setItemAsync(key, JSON.stringify(value));
  }

  private async get<T>(key: string): Promise<T | null> {
    const value = await getItemAsync(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  private async delete(key: string): Promise<void> {
    await deleteItemAsync(key);
  }

  // Auth tokens
  async getAuthTokens(): Promise<AuthTokens | null> {
    try {
      const parsed = await this.get<AuthTokens>(KEYS.AUTH_TOKEN);
      if (!parsed) {
        return null;
      }

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
      await this.set(KEYS.AUTH_TOKEN, tokens);
    } catch (e) {
      console.error("Failed to set auth tokens in storage", e);
      throw new Error("No se pudo guardar la sesión");
    }
  }

  // User data
  async getUser(): Promise<User | null> {
    try {
      const parsed = await this.get<User>(KEYS.USER);
      if (!parsed) {
        return null;
      }

      // Validate structure
      if (!(parsed.id && parsed.email && parsed.name)) {
        console.warn("Invalid user structure, clearing");
        await this.delete(KEYS.USER);
        return null;
      }

      return parsed;
    } catch (e) {
      console.error("Failed to get user from storage", e);
      await this.delete(KEYS.USER);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await this.set(KEYS.USER, user);
    } catch (e) {
      console.error("Failed to set user in storage", e);
      throw new Error("No se pudo guardar el usuario");
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await Promise.all([this.delete(KEYS.AUTH_TOKEN), this.delete(KEYS.USER)]);
    } catch (e) {
      console.error("Failed to clear auth from storage", e);
    }
  }

  // Quiz progress
  async getQuizProgress(): Promise<QuizProgress> {
    const defaultValue: QuizProgress = {
      streak: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      lastPlayed: null,
    };

    try {
      const parsed = await this.get<QuizProgress>(KEYS.QUIZ_PROGRESS);
      if (!parsed) {
        return defaultValue;
      }

      // Validate structure
      if (
        typeof parsed.streak !== "number" ||
        typeof parsed.totalAnswered !== "number" ||
        typeof parsed.correctAnswers !== "number"
      ) {
        console.warn(
          "Invalid quiz progress structure, returning default value.",
        );
        return defaultValue;
      }

      return parsed;
    } catch (e) {
      console.error(
        "CRITICAL: Failed to get quiz progress from storage. User data was NOT reset.",
        e,
      );
      return defaultValue;
    }
  }

  async setQuizProgress(progress: QuizProgress): Promise<void> {
    try {
      await this.set(KEYS.QUIZ_PROGRESS, progress);
    } catch (e) {
      console.error("Failed to set quiz progress in storage", e);
      throw new Error("No se pudo guardar el progreso");
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await Promise.all([this.clearAuth(), this.delete(KEYS.QUIZ_PROGRESS)]);
    } catch (e) {
      console.error("Failed to clear all data", e);
    }
  }
}

export const storage = new Storage();
