/**
 * Error handling utilities for consistent error management across the application.
 */

/**
 * Converts unknown error types to Error instances with consistent handling.
 * 
 * @param error - The unknown error to convert
 * @param fallbackMessage - Default message when error cannot be determined
 * @returns A proper Error instance
 */
export function toError(error: unknown, fallbackMessage = 'An unknown error occurred'): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error(fallbackMessage);
}

/**
 * Structured error logging for development and debugging.
 * In production, this should integrate with error monitoring service.
 * 
 * @param message - Human-readable error description
 * @param context - Additional context for debugging
 */
export function logError(message: string, context: Record<string, unknown> = {}): void {
  console.error(message, {
    ...context,
    timestamp: new Date().toISOString()
  });
}

/**
 * Retry utility with exponential backoff for handling transient failures.
 * Follows the BaseExecutor pattern for consistency.
 * 
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with operation result or rejects with final error
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = toError(error);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Creates a validation error handler for consistent Zod error processing.
 * 
 * @param schemaName - Name of the schema being validated for error context
 * @returns Function that validates data and throws consistent errors
 */
export function createValidator<T>(
  schema: { parse: (data: unknown) => T },
  schemaName: string
) {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      // Re-throw Zod errors with additional context
      if (error && typeof error === 'object' && 'issues' in error) {
        const message = `${schemaName} validation failed`;
        logError(message, { validationErrors: error.issues });
        throw new Error(message);
      }
      throw toError(error, `${schemaName} validation failed`);
    }
  };
}