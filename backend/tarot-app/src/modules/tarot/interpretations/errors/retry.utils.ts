import { AIProviderException } from './ai-error.types';

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof AIProviderException) {
        if (!error.retryable) {
          throw error;
        }
      } else {
        // Non-AIProviderException errors are not retried
        throw error;
      }

      // Last attempt - don't wait
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate delay with exponential backoff: 2^attempt * 1000ms
      // attempt 1: 2s, attempt 2: 4s, attempt 3: 8s
      const baseDelay = Math.pow(2, attempt + 1) * 1000;

      // Add jitter (±20%)
      const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
      const delay = Math.round(baseDelay + jitter);

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}
