/**
 * @scilent-one/logger - Core Logger
 *
 * Pino-based structured logging with request ID tracking support.
 * Outputs pretty logs in development and JSON in production.
 */

import pino from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerOptions {
  /** Namespace for the logger (e.g., 'api', 'auth', 'middleware') */
  namespace?: string;
  /** Base context to include in all log messages */
  context?: LogContext;
}

const isDevelopment = process.env['NODE_ENV'] !== 'production';

/**
 * Create the base pino logger instance.
 * Uses pino-pretty in development if available.
 */
function createBaseLogger(): pino.Logger {
  const level = process.env['LOG_LEVEL'] ?? (isDevelopment ? 'debug' : 'info');

  // In development, try to use pino-pretty for readable output
  if (isDevelopment) {
    try {
      // Check if pino-pretty is available
      require.resolve('pino-pretty');
      return pino({
        level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      });
    } catch {
      // pino-pretty not installed, fall through to JSON logger
    }
  }

  // Production: JSON logs for structured logging
  return pino({
    level,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

const baseLogger = createBaseLogger();

/**
 * Logger class providing structured logging with namespace support.
 *
 * @example
 * ```ts
 * import { Logger } from '@scilent-one/logger';
 *
 * const logger = new Logger({ namespace: 'api:users' });
 * logger.info('User created', { userId: '123' });
 * ```
 */
export class Logger {
  private logger: pino.Logger;
  private namespace: string;

  constructor(options: LoggerOptions = {}) {
    this.namespace = options.namespace ?? 'app';
    this.logger = baseLogger.child({
      namespace: this.namespace,
      ...options.context,
    });
  }

  /** Log at trace level */
  trace(message: string, context?: LogContext): void {
    this.logger.trace(context ?? {}, message);
  }

  /** Log at debug level */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  /** Log at info level */
  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  /** Log at warn level */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  /**
   * Log at error level with optional error object.
   * Error objects are automatically serialized with stack traces.
   */
  error(
    message: string,
    errorOrContext?: Error | LogContext,
    context?: LogContext
  ): void {
    if (errorOrContext instanceof Error) {
      this.logger.error(
        {
          err: {
            message: errorOrContext.message,
            name: errorOrContext.name,
            stack: errorOrContext.stack,
            ...(errorOrContext.cause ? { cause: String(errorOrContext.cause) } : {}),
          },
          ...context,
        },
        message
      );
    } else {
      this.logger.error(errorOrContext ?? {}, message);
    }
  }

  /** Log at fatal level with optional error object */
  fatal(message: string, error?: Error, context?: LogContext): void {
    this.logger.fatal(
      {
        ...(error
          ? {
              err: {
                message: error.message,
                name: error.name,
                stack: error.stack,
              },
            }
          : {}),
        ...context,
      },
      message
    );
  }

  /**
   * Create a child logger with additional context.
   * Useful for adding request-specific data like request IDs.
   */
  child(context: LogContext): Logger {
    const child = new Logger({ namespace: this.namespace });
    child.logger = this.logger.child(context);
    return child;
  }
}

/**
 * Default logger instance for quick use.
 * For namespaced logging, create a new Logger instance.
 */
export const logger = new Logger();

/**
 * Log an error with consistent formatting.
 * Convenience function for error logging across the application.
 *
 * @example
 * ```ts
 * import { logError } from '@scilent-one/logger';
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logError('Operation failed', error, { userId: '123' });
 * }
 * ```
 */
export function logError(
  message: string,
  error: unknown,
  context?: LogContext
): void {
  if (error instanceof Error) {
    logger.error(message, error, context);
  } else {
    logger.error(message, {
      error: String(error),
      ...context,
    });
  }
}

/**
 * Create a logger instance for a specific namespace.
 * Convenience function for creating namespaced loggers.
 *
 * @example
 * ```ts
 * import { createLogger } from '@scilent-one/logger';
 *
 * const logger = createLogger('api:posts');
 * logger.info('Post created');
 * ```
 */
export function createLogger(namespace: string, context?: LogContext): Logger {
  return new Logger({ namespace, ...(context ? { context } : {}) });
}
