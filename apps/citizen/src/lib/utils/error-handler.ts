export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new AppError("La solicitud tardó demasiado.", 408, "TIMEOUT");
  }

  return new AppError("Sin conexión o error de red.", 503, "NETWORK_ERROR");
};
