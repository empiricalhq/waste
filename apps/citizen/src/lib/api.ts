import { API_URL } from "@/constants";
import { storage } from "@/lib/storage";
import type {
  ApiError,
  CreateReportInput,
  LoginInput,
  Report,
  SignUpInput,
  Truck,
  TruckStatus,
  User,
} from "@/types";

class ApiClient {
  private readonly baseUrl = API_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await storage.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          message: error.message || "Request failed",
          code: error.code,
        };
        throw apiError;
      }

      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      if ((error as ApiError).message) {
        throw error;
      }
      throw {
        message: "Network error",
        code: "NETWORK_ERROR",
      } as ApiError;
    }
  }

  // auth
  async login(input: LoginInput): Promise<User> {
    const response = await this.request<{ user: User; token: string }>(
      "/api/auth/sign-in/email",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

    if (response.token) {
      await storage.setToken(response.token);
      await storage.setUser(response.user);
    }

    return response.user;
  }

  async signUp(input: SignUpInput): Promise<User> {
    const response = await this.request<{ user: User; token: string }>(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

    if (response.token) {
      await storage.setToken(response.token);
      await storage.setUser(response.user);
    }

    return response.user;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/api/auth/sign-out", { method: "POST" });
    } finally {
      await storage.clearAuth();
    }
  }

  async getSession(): Promise<User | null> {
    try {
      const response = await this.request<{ user: User }>(
        "/api/auth/get-session",
      );
      return response.user;
    } catch {
      return null;
    }
  }

  // trucks
  async getTrucks(): Promise<Truck[]> {
    const trucks = await this.request<
      Array<{
        id: string;
        name: string;
        license_plate: string;
        lat: number;
        lng: number;
        location_updated_at: string;
      }>
    >("/api/citizen/trucks");

    return trucks.map((t) => ({
      id: t.id,
      name: t.name,
      licensePlate: t.license_plate,
      lat: t.lat,
      lng: t.lng,
      lastUpdate: t.location_updated_at,
    }));
  }

  async getTruckStatus(): Promise<TruckStatus> {
    const response = await this.request<{
      status: string;
      message?: string;
      etaMinutes?: number;
      truck?: string;
    }>("/api/citizen/truck/status");

    let status: TruckStatus["status"] = "idle";
    if (response.status === "NEARBY") {
      status = "active";
    } else if (response.status === "LOCATION_NOT_SET") {
      status = "not_scheduled";
    }

    return {
      status,
      message: response.message,
      etaMinutes: response.etaMinutes,
      truckId: response.truck,
    };
  }

  // reports
  async createReport(input: CreateReportInput): Promise<Report> {
    const response = await this.request<{
      id: string;
      type: string;
      description: string;
      status: string;
      lat: number;
      lng: number;
      photo_url?: string;
      created_at: string;
    }>("/api/citizen/issues", {
      method: "POST",
      body: JSON.stringify({
        type: input.type,
        description: input.description,
        lat: input.latitude,
        lng: input.longitude,
        photo_url: input.photoUrl,
      }),
    });

    return {
      id: response.id,
      type: response.type as Report["type"],
      description: response.description,
      status: this.mapStatus(response.status),
      latitude: response.lat,
      longitude: response.lng,
      photoUrl: response.photo_url,
      createdAt: response.created_at,
    };
  }

  private mapStatus(status: string): Report["status"] {
    if (status === "in_progress") {
      return "in_progress";
    }
    if (status === "resolved") {
      return "resolved";
    }
    return "open";
  }
}

export const api = new ApiClient();
