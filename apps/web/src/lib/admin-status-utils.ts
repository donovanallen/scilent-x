export interface SanitizedDatabaseMetadata {
  host: string;
  port: string;
  environment: 'local' | 'remote' | 'not configured' | 'invalid';
}

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function sanitizeDatabaseMetadata(
  databaseUrl: string | undefined
): SanitizedDatabaseMetadata {
  if (!databaseUrl) {
    return {
      host: 'Not configured',
      port: 'N/A',
      environment: 'not configured',
    };
  }

  try {
    const url = new URL(databaseUrl);
    const host = url.hostname || 'Unknown';

    return {
      host,
      port: url.port || '5432',
      environment: LOCAL_DATABASE_HOSTS.has(host) ? 'local' : 'remote',
    };
  } catch {
    return {
      host: 'Invalid connection configuration',
      port: 'N/A',
      environment: 'invalid',
    };
  }
}

export function resolveBuildTimestamp(
  environment: Readonly<Record<string, string | undefined>>,
  fallback: string
): { timestamp: string; source: 'deployment' | 'build' | 'server start' } {
  const deploymentTimestamp = environment.VERCEL_DEPLOYMENT_CREATED_AT;
  if (deploymentTimestamp && !Number.isNaN(Date.parse(deploymentTimestamp))) {
    return { timestamp: deploymentTimestamp, source: 'deployment' };
  }

  const buildTimestamp = environment.SCILENT_BUILD_TIME;
  if (buildTimestamp && !Number.isNaN(Date.parse(buildTimestamp))) {
    return { timestamp: buildTimestamp, source: 'build' };
  }

  const sourceDateEpoch = environment.SOURCE_DATE_EPOCH;
  if (sourceDateEpoch) {
    const epochMilliseconds = Number(sourceDateEpoch) * 1000;
    if (Number.isFinite(epochMilliseconds)) {
      return {
        timestamp: new Date(epochMilliseconds).toISOString(),
        source: 'build',
      };
    }
  }

  return { timestamp: fallback, source: 'server start' };
}

export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
