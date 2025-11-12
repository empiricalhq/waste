import { API_TIMEOUT, API_URL } from "@/constants";
import type {
  Collection,
  LoginInput,
  QuizQuestion,
  Report,
  ReportType,
  SignUpInput,
  Truck,
  User,
} from "./schemas";
import { storage } from "./storage";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await storage.getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Error en la solicitud",
        response.status,
        error.code,
      );
    }

    if (response.status === 204) {
      return null as T;
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if ((error as Error).name === "AbortError") {
      throw new ApiError("Tiempo agotado", 408, "TIMEOUT");
    }
    throw new ApiError("Error de conexión", 0, "NETWORK_ERROR");
  }
}

export const api = {
  // auth
  async login(data: LoginInput) {
    const result = await request<{ user: User; session: { token: string } }>(
      "/api/auth/sign-in/email",
      { method: "POST", body: JSON.stringify(data) },
    );
    await storage.setToken(result.session.token);
    return result.user;
  },

  async signUp(data: SignUpInput) {
    const result = await request<{ user: User; session: { token: string } }>(
      "/api/auth/sign-up/email",
      { method: "POST", body: JSON.stringify(data) },
    );
    await storage.setToken(result.session.token);
    return result.user;
  },

  async logout() {
    try {
      await request("/api/auth/sign-out", { method: "POST" });
    } finally {
      await storage.removeToken();
    }
  },

  async getCurrentUser() {
    const { user } = await request<{ user: User }>("/api/auth/get-session");
    return user;
  },

  // collections
  getCollections: () => request<Collection[]>("/collections"),

  // trucks
  getTrucks: () => request<Truck[]>("/trucks"),

  // reports
  getReports: () => request<Report[]>("/reports"),
  getReportTypes: () => request<ReportType[]>("/report-types"),
  createReport: (data: {
    type: string;
    description: string;
    location: string;
    imageUri?: string;
  }) =>
    request<Report>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // quiz
  getQuizQuestions: () => request<QuizQuestion[]>("/quiz/questions"),
  updateProgress: (score: number) =>
    request<User>("/users/me/progress", {
      method: "PATCH",
      body: JSON.stringify({ score }),
    }),
};
