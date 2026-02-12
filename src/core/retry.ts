export interface RetryOptions {
  retries?: number;
  onRetry?: (context: { attempt: number; error: unknown }) => void;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 0;
  const onRetry = options.onRetry;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        onRetry?.({ attempt: attempt + 1, error });
      }
    }
  }

  throw lastError;
}
