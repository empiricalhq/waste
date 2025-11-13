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
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  }

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER]);
  }

  // quiz progress (local only)
  async getQuizProgress(): Promise<QuizProgress> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUIZ_PROGRESS);
      return data
        ? JSON.parse(data)
        : { streak: 0, totalAnswered: 0, correctAnswers: 0, lastPlayed: null };
    } catch {
      return {
        streak: 0,
        totalAnswered: 0,
        correctAnswers: 0,
        lastPlayed: null,
      };
    }
  }

  async setQuizProgress(progress: QuizProgress): Promise<void> {
    await AsyncStorage.setItem(KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
  }
}

export const storage = new Storage();
