export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new AppError('La solicitud tardó demasiado.', 408, 'TIMEOUT');
  }

  return new AppError('Sin conexión o error de red.', 503, 'NETWORK_ERROR');
};

/**
 * Create a network error
 */
export const createNetworkError = (message?: string): AppError => {
  return new AppError(
    message || 'Sin conexión o error de red.',
    503,
    'NETWORK_ERROR'
  );
};

/**
 * Create a timeout error
 */
export const createTimeoutError = (message?: string): AppError => {
  return new AppError(
    message || 'La solicitud tardó demasiado.',
    408,
    'TIMEOUT'
  );
};

/**
 * Create a validation error
 */
export const createValidationError = (message: string): AppError => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Create an unauthorized error
 */
export const createUnauthorizedError = (message?: string): AppError => {
  return new AppError(
    message || 'Tu sesión expiró. Por favor, inicia sesión de nuevo.',
    401,
    'UNAUTHORIZED'
  );
};

/**
 * Create a forbidden error
 */
export const createForbiddenError = (message?: string): AppError => {
  return new AppError(
    message || 'No tienes permiso para acceder a este recurso.',
    403,
    'FORBIDDEN'
  );
};

/**
 * Create a not found error
 */
export const createNotFoundError = (message?: string): AppError => {
  return new AppError(
    message || 'No pudimos encontrar lo que buscas.',
    404,
    'NOT_FOUND'
  );
};

/**
 * Create a server error
 */
export const createServerError = (message?: string): AppError => {
  return new AppError(
    message || 'Estamos teniendo problemas. Intenta en unos minutos.',
    500,
    'SERVER_ERROR'
  );
};
