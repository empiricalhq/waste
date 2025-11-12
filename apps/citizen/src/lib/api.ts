import { API_TIMEOUT, API_URL } from "@/constants";
import type {
  Collection,
  LoginInput,
  QuizQuestion,
  ReportType,
  SignUpInput,
  User,
} from "./schemas";
import { storage } from "./storage";

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function extractSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }
  // Handle both single cookie and multiple cookies (comma-separated or semicolon-separated)
  const cookies = cookieHeader.split(/[,;]/).map((c) => c.trim());
  for (const cookie of cookies) {
    const match = cookie.match(/better-auth\.session_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await storage.getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Better-auth uses cookies for authentication
    if (token) {
      headers.Cookie = `better-auth.session_token=${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.error || error.message || "Error en la solicitud",
        response.status,
        error.code,
      );
    }

    if (response.status === 204) {
      return null as T;
    }

    const json = await response.json();
    // API wraps responses in { data: ... } format
    return (json.data !== undefined ? json.data : json) as T;
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

async function handleAuthResponse(response: Response): Promise<User> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.error || error.message || "Error en la solicitud",
      response.status,
      error.code,
    );
  }

  // Extract session token from cookie
  const cookieHeader = response.headers.get("set-cookie");
  const sessionToken = extractSessionToken(cookieHeader);

  if (sessionToken) {
    await storage.setToken(sessionToken);
  }

  const json = await response.json();
  const result = json.data !== undefined ? json.data : json;

  // Better-auth returns { user, session } in the response
  if (result.user) {
    return result.user as User;
  }

  // If user is not in response, fetch it separately
  return api.getCurrentUser();
}

export const api = {
  // auth
  async login(data: LoginInput) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleAuthResponse(response);
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
  },

  async signUp(data: SignUpInput) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleAuthResponse(response);
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
  },

  async logout() {
    try {
      await request("/api/auth/sign-out", { method: "POST" });
    } finally {
      await storage.removeToken();
    }
  },

  async getCurrentUser() {
    const result = await request<{ user: User; session: unknown }>(
      "/api/auth/get-session",
    );
    return result.user;
  },

  // collections
  getCollections: () => request<Collection[]>("/api/citizen/collections"),

  // trucks
  async getTrucks() {
    const status = await request<{
      status: string;
      message?: string;
      etaMinutes?: number;
      truck?: string;
    }>("/api/citizen/truck/status");

    // Transform to array format expected by the app
    if (
      status.status === "LOCATION_NOT_SET" ||
      status.status === "NOT_SCHEDULED"
    ) {
      return [];
    }

    // Return a single truck status as an array
    return [
      {
        id: status.truck || "unknown",
        type: "general" as const, // Default type, API doesn't provide this
        eta: status.etaMinutes || 0,
        route: status.truck || "",
      },
    ];
  },

  // reports
  async getReports() {
    const issues = await request<
      Array<{
        id: string;
        user_id: string;
        type: string;
        status: string;
        description?: string;
        photo_url?: string;
        lat: number;
        lng: number;
        created_at: string | Date;
      }>
    >("/api/citizen/issues");

    return issues.map((issue) => {
      const statusMap: Record<string, "pending" | "in-progress" | "resolved"> =
        {
          open: "pending",
          in_progress: "in-progress",
          resolved: "resolved",
        };

      return {
        id: issue.id,
        type: issue.type,
        description: issue.description || "",
        status: statusMap[issue.status] || "pending",
        createdAt:
          typeof issue.created_at === "string"
            ? issue.created_at
            : issue.created_at.toISOString(),
      };
    });
  },

  getReportTypes: () => request<ReportType[]>("/api/citizen/report-types"),

  async createReport(data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUri?: string;
  }) {
    // Validate coordinates
    if (
      !(data.latitude && data.longitude) ||
      Number.isNaN(data.latitude) ||
      Number.isNaN(data.longitude) ||
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      throw new ApiError("Coordenadas inválidas", 400, "INVALID_COORDINATES");
    }

    // Map report type label to API type
    const typeMap: Record<string, "missed_collection" | "illegal_dumping"> = {
      "Recolección perdida": "missed_collection",
      "Vertido ilegal": "illegal_dumping",
    };

    const apiType = typeMap[data.type] || "illegal_dumping";

    const issue = await request<{
      id: string;
      user_id: string;
      type: string;
      status: string;
      description?: string;
      photo_url?: string;
      lat: number;
      lng: number;
      created_at: string | Date;
    }>("/api/citizen/issues", {
      method: "POST",
      body: JSON.stringify({
        type: apiType,
        description: data.description,
        photo_url: data.imageUri,
        lat: data.latitude,
        lng: data.longitude,
      }),
    });

    const statusMap: Record<string, "pending" | "in-progress" | "resolved"> = {
      open: "pending",
      in_progress: "in-progress",
      resolved: "resolved",
    };

    return {
      id: issue.id,
      type: issue.type,
      description: issue.description || "",
      status: statusMap[issue.status] || "pending",
      createdAt:
        typeof issue.created_at === "string"
          ? issue.created_at
          : issue.created_at.toISOString(),
    };
  },

  // quiz
  getQuizQuestions: () =>
    request<QuizQuestion[]>("/api/citizen/quiz/questions"),

  async updateProgress(score: number) {
    // The API expects { content_id: string, score: number }
    // We'll use a default content_id for now
    await request("/api/citizen/education/progress", {
      method: "POST",
      body: JSON.stringify({ content_id: "waste-quiz", score }),
    });

    // Return updated user by fetching session
    return this.getCurrentUser();
  },
};
