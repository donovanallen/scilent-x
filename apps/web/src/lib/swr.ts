export class ApiError extends Error {
  status: number;
  info?: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.info = info;
  }
}

export async function fetcher<T>(input: RequestInfo | URL): Promise<T> {
  const response = await fetch(input);

  if (!response.ok) {
    let info: unknown = null;
    try {
      info = await response.json();
    } catch {
      info = null;
    }

    const message =
      typeof info === 'object' && info && 'error' in info
        ? String((info as { error: unknown }).error)
        : 'Request failed';

    throw new ApiError(message, response.status, info);
  }

  return (await response.json()) as T;
}
