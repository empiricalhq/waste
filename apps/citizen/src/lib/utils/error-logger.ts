/**
 * Error logging utility for tracking and reporting errors
 * In production, this would integrate with services like Sentry, Bugsnag, etc.
 */

interface ErrorContext {
  feature?: string;
  componentStack?: string;
  errorBoundary?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Log an error with context information
 * @param error - The error to log
 * @param context - Additional context about where/why the error occurred
 */
export const logError = (error: Error, context?: ErrorContext): void => {
  // In development, log to console
  if (__DEV__) {
    console.error('Error logged:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { contexts: { custom: context } });

  // For now, we'll just log to console in production too
  // Replace this with actual error tracking service integration
  console.error('Production error:', {
    message: error.message,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log a warning (non-critical error)
 * @param message - Warning message
 * @param context - Additional context
 */
export const logWarning = (message: string, context?: ErrorContext): void => {
  if (__DEV__) {
    console.warn('Warning:', message, context);
    return;
  }

  // In production, send to tracking service
  console.warn('Production warning:', message, context);
};

/**
 * Log an info message for debugging
 * @param message - Info message
 * @param context - Additional context
 */
export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  if (__DEV__) {
    console.log('Info:', message, context);
  }
};
