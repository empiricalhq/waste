export const AUTH_ERROR_CODE = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  NETWORK_ERROR: "NETWORK_ERROR",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE];

export class AuthError extends Error {
  public code: AuthErrorCode;
  public originalError?: Error;

  constructor(code: AuthErrorCode, message: string, originalError?: Error) {
    super(message);
    this.code = code;
    this.originalError = originalError;
    this.name = "AuthError";
  }

  static fromApiError(error: unknown): AuthError {
    const e = error as {
      response?: { status?: number };
      code?: string;
      status?: number;
    };

    // network or connectivity error
    if (!e.response || e.code === AUTH_ERROR_CODE.NETWORK_ERROR) {
      return new AuthError(
        AUTH_ERROR_CODE.NETWORK_ERROR,
        "Error de conexión. Por favor verifica tu conexión a internet.",
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    const status = e.response?.status ?? e.status;

    switch (status) {
      case 401:
        return new AuthError(
          AUTH_ERROR_CODE.INVALID_CREDENTIALS,
          "Credenciales inválidas. Por favor verifica tu email y contraseña.",
          error instanceof Error ? error : new Error(String(error)),
        );
      case 404:
        return new AuthError(
          AUTH_ERROR_CODE.USER_NOT_FOUND,
          "Usuario no encontrado. Por favor verifica tu email.",
          error instanceof Error ? error : new Error(String(error)),
        );
      case 409:
        return new AuthError(
          AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS,
          "Este email ya está registrado. Intenta iniciar sesión.",
          error instanceof Error ? error : new Error(String(error)),
        );
      default:
        return new AuthError(
          AUTH_ERROR_CODE.UNKNOWN_ERROR,
          "Ocurrió un error inesperado. Por favor intenta de nuevo.",
          error instanceof Error ? error : new Error(String(error)),
        );
    }
  }

  getUserFriendlyMessage(): string {
    switch (this.code) {
      case AUTH_ERROR_CODE.INVALID_CREDENTIALS:
        return "Credenciales inválidas. Por favor verifica tu email y contraseña.";
      case AUTH_ERROR_CODE.NETWORK_ERROR:
        return "Error de conexión. Por favor verifica tu conexión a internet.";
      case AUTH_ERROR_CODE.TOKEN_EXPIRED:
        return "Tu sesión ha expirado. Por favor inicia sesión de nuevo.";
      case AUTH_ERROR_CODE.USER_NOT_FOUND:
        return "Usuario no encontrado. Por favor verifica tu email.";
      case AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS:
        return "Este email ya está registrado. Intenta iniciar sesión.";
      case AUTH_ERROR_CODE.WEAK_PASSWORD:
        return "La contraseña debe tener al menos 8 caracteres.";
      default:
        return "Ocurrió un error inesperado. Por favor intenta de nuevo.";
    }
  }
}
