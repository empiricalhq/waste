import { API_URL, RETRY_CONFIG, TOKEN_EXPIRY_BUFFER } from "@/constants";
import { storage } from "@/lib/storage";
import type {
  CreateReportInput,
  LoginInput,
  Report,
  SignUpInput,
  Truck,
  TruckStatus,
  User,
} from "@/types";

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

const VALID_REPORT_TYPES = ["missed_collection", "illegal_dumping", "other"];

class ApiClient {
  private readonly baseUrl = API_URL;

  private async getValidToken(): Promise<string | null> {
    const tokens = await storage.getAuthTokens();
    if (!tokens) {
      return null;
    }

    // If token expires in less than TOKEN_EXPIRY_BUFFER, try to refresh
    const timeUntilExpiry = tokens.expiresAt - Date.now();
    if (timeUntilExpiry < TOKEN_EXPIRY_BUFFER) {
      console.info("Token expiring soon, should implement refresh");
      // TODO: Implement token refresh endpoint when backend supports it
      // For now, we just let it expire and user re-authenticates
    }

    return tokens.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getValidToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < RETRY_CONFIG.MAX_ATTEMPTS; attempt++) {
      try {
        // biome-ignore lint/performance/noAwaitInLoops: intentional retry delay
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });

        if (response.status === 401) {
          await storage.clearAuth();
          throw new ApiError(
            "Sesión expirada. Por favor, inicia sesión nuevamente",
            "AUTH_EXPIRED",
          );
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: "Error del servidor",
          }));
          throw new ApiError(
            error.message || "Error en la solicitud",
            error.code,
          );
        }

        if (response.status === 204) {
          return null as T;
        }

        const data = await response.json();
        return data.data !== undefined ? data.data : data;
      } catch (error) {
        lastError = error as Error;

        // don't retry auth errors or client errors (4xx)
        if (error instanceof ApiError) {
          if (error.code === "AUTH_EXPIRED") {
            throw error;
          }
          throw error;
        }

        // retry on network errors
        if (attempt < RETRY_CONFIG.MAX_ATTEMPTS - 1) {
          const delay = Math.min(
            RETRY_CONFIG.BASE_DELAY * 2 ** attempt,
            RETRY_CONFIG.MAX_DELAY,
          );
          console.info(
            `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.MAX_ATTEMPTS})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error("All retry attempts failed:", lastError);
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión",
      "NETWORK_ERROR",
    );
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
      // set expiry to 30 days from now (TODO: check with apps/api)
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await storage.setAuthTokens({ token: response.token, expiresAt });
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
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await storage.setAuthTokens({ token: response.token, expiresAt });
      await storage.setUser(response.user);
    }

    return response.user;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/api/auth/sign-out", { method: "POST" });
    } catch (error) {
      console.warn("Logout request failed, clearing local data anyway", error);
    } finally {
      await storage.clearAuth();
    }
  }

  /**
   * Gets user from local storage (not API).
   * Call this on app start to restore session.
   */
  getStoredUser(): Promise<User | null> {
    return storage.getUser();
  }

  /**
   * Validates stored token by making an authenticated request.
   * Only call this when you need to verify the session is still valid.
   */
  async validateSession(): Promise<User | null> {
    try {
      const response = await this.request<{ user: User }>(
        "/api/auth/get-session",
      );
      return response.user;
    } catch (error) {
      if (error instanceof ApiError && error.code === "AUTH_EXPIRED") {
        return null;
      }
      throw error;
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

    // validate response
    if (!VALID_REPORT_TYPES.includes(response.type)) {
      throw new ApiError("Tipo de reporte inválido", "INVALID_REPORT_TYPE");
    }

    const status = this.mapStatus(response.status);
    if (!status) {
      throw new ApiError("Estado de reporte inválido", "INVALID_STATUS");
    }

    return {
      id: response.id,
      type: response.type as Report["type"],
      description: response.description,
      status,
      latitude: response.lat,
      longitude: response.lng,
      photoUrl: response.photo_url,
      createdAt: response.created_at,
    };
  }

  private mapStatus(status: string): Report["status"] | null {
    const mapped = {
      in_progress: "in_progress",
      resolved: "resolved",
      open: "open",
    } as const;

    return mapped[status as keyof typeof mapped] || null;
  }
}

export const api = new ApiClient();
