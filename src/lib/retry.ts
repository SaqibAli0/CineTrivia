/**
 * Retry utility with exponential backoff.
 *
 * Retries a function up to `maxAttempts` times with increasing
 * delays between attempts. Only retries on transient errors
 * (503, 429, network failures).
 */

function isTransientError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('Service Unavailable') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('fetch failed')
  );
}

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000 } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-transient errors
      if (!isTransientError(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
