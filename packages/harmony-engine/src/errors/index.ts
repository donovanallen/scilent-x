export class HarmonizationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "HarmonizationError";
  }
}

export class HttpError extends HarmonizationError {
  constructor(
    message: string,
    public readonly status: number,
    provider?: string
  ) {
    super(message, `HTTP_${status}`, provider);
    this.name = "HttpError";
  }
}

export class RateLimitError extends HarmonizationError {
  constructor(
    provider: string,
    public readonly retryAfter?: number
  ) {
    super(`Rate limited by ${provider}`, "RATE_LIMITED", provider);
    this.name = "RateLimitError";
  }
}

export class ProviderNotFoundError extends HarmonizationError {
  constructor(provider: string) {
    super(`Provider not found: ${provider}`, "PROVIDER_NOT_FOUND");
    this.name = "ProviderNotFoundError";
  }
}

export class ValidationError extends HarmonizationError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ProviderError extends HarmonizationError {
  constructor(message: string, provider: string, cause?: Error) {
    super(message, "PROVIDER_ERROR", provider, cause);
    this.name = "ProviderError";
  }
}

export class UserAuthNotSupportedError extends HarmonizationError {
  constructor(provider: string) {
    super(
      `User authentication is not supported by ${provider}`,
      "USER_AUTH_NOT_SUPPORTED",
      provider
    );
    this.name = "UserAuthNotSupportedError";
  }
}
