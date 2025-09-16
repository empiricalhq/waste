type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const _logData = {
      timestamp,
      level,
      message,
      ...context,
    };
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    });
  }
}

export const logger = new Logger();
