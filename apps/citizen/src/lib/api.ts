import type {
  Collection,
  LoginInput,
  QuizQuestion,
  Report,
  ReportType,
  SignUpInput,
  Truck,
  TruckWithLocation,
  User,
} from "@/types";
import { apiClient } from "./api-client";
import { storage } from "./storage";

export const api = {
  // Authentication
  async login(data: LoginInput): Promise<User> {
    return apiClient.authRequest<User>("/api/auth/sign-in/email", data);
  },

  async signUp(data: SignUpInput): Promise<User> {
    return apiClient.authRequest<User>("/api/auth/sign-up/email", data);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/sign-out");
    } finally {
      await storage.clearAll();
    }
  },

  async getCurrentUser(): Promise<User> {
    const result = await apiClient.get<{ user: User; session: unknown }>(
      "/api/auth/get-session",
    );
    return result.user;
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    return apiClient.get<Collection[]>("/api/citizen/collections");
  },

  async getNextCollection(): Promise<Collection | null> {
    const collections = await this.getCollections();
    const upcoming = collections
      .filter((c) => !c.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcoming[0] || null;
  },

  // Trucks
  async getTruckStatus(): Promise<Truck[]> {
    const status = await apiClient.get<{
      status: string;
      message?: string;
      etaMinutes?: number;
      truck?: string;
    }>("/api/citizen/truck/status");

    if (
      status.status === "LOCATION_NOT_SET" ||
      status.status === "NOT_SCHEDULED"
    ) {
      return [];
    }

    return [
      {
        id: status.truck || "unknown",
        type: "general",
        eta: status.etaMinutes || 0,
        route: status.truck || "",
      },
    ];
  },

  async getTrucksWithLocations(): Promise<TruckWithLocation[]> {
    return apiClient.get<TruckWithLocation[]>("/api/citizen/trucks");
  },

  // Reports
  async getReports(): Promise<Report[]> {
    const issues = await apiClient.get<
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

    const statusMap: Record<string, "pending" | "in-progress" | "resolved"> = {
      open: "pending",
      in_progress: "in-progress",
      resolved: "resolved",
    };

    return issues.map((issue) => ({
      id: issue.id,
      type: issue.type,
      description: issue.description || "",
      status: statusMap[issue.status] || "pending",
      createdAt:
        typeof issue.created_at === "string"
          ? issue.created_at
          : issue.created_at.toISOString(),
    }));
  },

  async getReportTypes(): Promise<ReportType[]> {
    return apiClient.get<ReportType[]>("/api/citizen/report-types");
  },

  async createReport(data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUri?: string;
  }): Promise<Report> {
    const typeMap: Record<string, "missed_collection" | "illegal_dumping"> = {
      "Recolección perdida": "missed_collection",
      "Vertido ilegal": "illegal_dumping",
    };

    const issue = await apiClient.post<{
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
      type: typeMap[data.type] || "illegal_dumping",
      description: data.description,
      photo_url: data.imageUri,
      lat: data.latitude,
      lng: data.longitude,
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

  // Quiz
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    return apiClient.get<QuizQuestion[]>("/api/citizen/quiz/questions");
  },

  async updateProgress(score: number): Promise<User> {
    await apiClient.post("/api/citizen/education/progress", {
      content_id: "waste-quiz",
      score,
    });
    return this.getCurrentUser();
  },
};
