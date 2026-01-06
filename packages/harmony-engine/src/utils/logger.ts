import pino from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
}

// Don't use transport in bundled environments - output JSON logs
const baseLogger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
});

export class Logger {
  private logger: pino.Logger;

  constructor(namespace: string) {
    this.logger = baseLogger.child({ namespace });
  }

  trace(message: string, context?: LogContext): void {
    this.logger.trace(context, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context, message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context, message);
  }

  error(
    message: string,
    error?: Error | LogContext,
    context?: LogContext
  ): void {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...context }, message);
    } else {
      this.logger.error(error, message);
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.logger.fatal({ err: error, ...context }, message);
  }

  child(context: LogContext): Logger {
    const child = new Logger('');
    child.logger = this.logger.child(context);
    return child;
  }
}
