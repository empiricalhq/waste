import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QuizProgress, User } from "@/types";

const KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  QUIZ_PROGRESS: "quiz_progress",
} as const;

class Storage {
  // auth
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error("Failed to get auth token from storage", e);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error("Failed to set auth token in storage", e);
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to get user from storage", e);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to set user in storage", e);
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER]);
    } catch (e) {
      console.error("Failed to clear auth from storage", e);
    }
  }

  // quiz progress (local only)
  async getQuizProgress(): Promise<QuizProgress> {
    const defaultValue = {
      streak: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      lastPlayed: null,
    };
    try {
      const data = await AsyncStorage.getItem(KEYS.QUIZ_PROGRESS);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error("Failed to get quiz progress from storage", e);
      return defaultValue;
    }
  }

  async setQuizProgress(progress: QuizProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.QUIZ_PROGRESS,
        JSON.stringify(progress),
      );
    } catch (e) {
      console.error("Failed to set quiz progress in storage", e);
    }
  }
}

export const storage = new Storage();
