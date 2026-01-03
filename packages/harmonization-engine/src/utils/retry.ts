import pRetry, { AbortError } from "p-retry";
import type { Logger } from "./logger.js";
import { HttpError } from "../errors/index.js";

export interface RetryConfig {
  retries: number;
  minTimeout: number;
  maxTimeout: number;
  factor: number;
  retryableStatusCodes?: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 10000,
  factor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  logger?: Logger
): Promise<T> {
  return pRetry(
    async (attemptCount) => {
      try {
        return await fn();
      } catch (error) {
        // Don't retry client errors (4xx except rate limits)
        if (error instanceof HttpError) {
          if (!config.retryableStatusCodes?.includes(error.status)) {
            throw new AbortError(error.message);
          }
        }

        logger?.warn("Retry attempt", {
          attempt: attemptCount,
          error: error instanceof Error ? error.message : "Unknown",
        });

        throw error;
      }
    },
    {
      retries: config.retries,
      minTimeout: config.minTimeout,
      maxTimeout: config.maxTimeout,
      factor: config.factor,
      onFailedAttempt: (error) => {
        logger?.warn("Attempt failed", {
          attempt: error.attemptNumber,
          retriesLeft: error.retriesLeft,
          error: error.message,
        });
      },
    }
  );
}
