export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  NETWORK_ERROR = "NETWORK_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "AuthError";
  }

  static fromApiError(error: any): AuthError {
    // handle network errors
    if (!error.response || error.code === "NETWORK_ERROR") {
      return new AuthError(
        AuthErrorCode.NETWORK_ERROR,
        "Error de conexión. Por favor verifica tu conexión a internet.",
        error,
      );
    }

    // handle HTTP status codes
    const status = error.response?.status || error.status;

    switch (status) {
      case 401:
        return new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          "Credenciales inválidas. Por favor verifica tu email y contraseña.",
          error,
        );
      case 404:
        return new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          "Usuario no encontrado. Por favor verifica tu email.",
          error,
        );
      case 409:
        return new AuthError(
          AuthErrorCode.EMAIL_ALREADY_EXISTS,
          "Este email ya está registrado. Intenta iniciar sesión.",
          error,
        );
      default:
        return new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          "Ocurrió un error inesperado. Por favor intenta de nuevo.",
          error,
        );
    }
  }

  getUserFriendlyMessage(): string {
    switch (this.code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        return "Credenciales inválidas. Por favor verifica tu email y contraseña.";
      case AuthErrorCode.NETWORK_ERROR:
        return "Error de conexión. Por favor verifica tu conexión a internet.";
      case AuthErrorCode.TOKEN_EXPIRED:
        return "Tu sesión ha expirado. Por favor inicia sesión de nuevo.";
      case AuthErrorCode.USER_NOT_FOUND:
        return "Usuario no encontrado. Por favor verifica tu email.";
      case AuthErrorCode.EMAIL_ALREADY_EXISTS:
        return "Este email ya está registrado. Intenta iniciar sesión.";
      case AuthErrorCode.WEAK_PASSWORD:
        return "La contraseña debe tener al menos 8 caracteres.";
      default:
        return "Ocurrió un error inesperado. Por favor intenta de nuevo.";
    }
  }
}
