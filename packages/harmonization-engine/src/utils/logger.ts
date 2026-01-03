import pino from "pino";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  [key: string]: unknown;
}

const pinoOptions: pino.LoggerOptions =
  process.env["NODE_ENV"] === "development"
    ? {
        level: process.env["LOG_LEVEL"] ?? "info",
        transport: { target: "pino-pretty", options: { colorize: true } },
      }
    : {
        level: process.env["LOG_LEVEL"] ?? "info",
      };

const baseLogger = pino(pinoOptions);

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
    const child = new Logger("");
    child.logger = this.logger.child(context);
    return child;
  }
}
