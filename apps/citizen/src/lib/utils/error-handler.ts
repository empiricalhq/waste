const HTTP_STATUS_REQUEST_TIMEOUT = 408;
const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
const HTTP_STATUS_VALIDATION = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_SERVER_ERROR = 500;

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new AppError(
      "La solicitud tardó demasiado.",
      HTTP_STATUS_REQUEST_TIMEOUT,
      "TIMEOUT",
    );
  }

  return new AppError(
    "Sin conexión o error de red.",
    HTTP_STATUS_SERVICE_UNAVAILABLE,
    "NETWORK_ERROR",
  );
};

// Create a network error
export const createNetworkError = (message?: string): AppError => {
  return new AppError(
    message || "Sin conexión o error de red.",
    HTTP_STATUS_SERVICE_UNAVAILABLE,
    "NETWORK_ERROR",
  );
};

// Create a timeout error
export const createTimeoutError = (message?: string): AppError => {
  return new AppError(
    message || "La solicitud tardó demasiado.",
    HTTP_STATUS_REQUEST_TIMEOUT,
    "TIMEOUT",
  );
};

// Create a validation error
export const createValidationError = (message: string): AppError => {
  return new AppError(message, HTTP_STATUS_VALIDATION, "VALIDATION_ERROR");
};

// Create an unauthorized error
export const createUnauthorizedError = (message?: string): AppError => {
  return new AppError(
    message || "Tu sesión expiró. Por favor, inicia sesión de nuevo.",
    HTTP_STATUS_UNAUTHORIZED,
    "UNAUTHORIZED",
  );
};

// Create a forbidden error
export const createForbiddenError = (message?: string): AppError => {
  return new AppError(
    message || "No tienes permiso para acceder a este recurso.",
    HTTP_STATUS_FORBIDDEN,
    "FORBIDDEN",
  );
};

// Create a not found error
export const createNotFoundError = (message?: string): AppError => {
  return new AppError(
    message || "No pudimos encontrar lo que buscas.",
    HTTP_STATUS_NOT_FOUND,
    "NOT_FOUND",
  );
};

// Create a server error
export const createServerError = (message?: string): AppError => {
  return new AppError(
    message || "Estamos teniendo problemas. Intenta en unos minutos.",
    HTTP_STATUS_SERVER_ERROR,
    "SERVER_ERROR",
  );
};
