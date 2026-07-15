import 'server-only';

import { db } from '@scilent-one/db';

import { env } from '@/env';

import authPackage from '../../../../packages/auth/package.json';
import databasePackage from '../../../../packages/db/package.json';
import harmonyPackage from '../../../../packages/harmony-engine/package.json';
import loggerPackage from '../../../../packages/logger/package.json';
import scilentUiPackage from '../../../../packages/scilent-ui/package.json';
import uiPackage from '../../../../packages/ui/package.json';
import webPackage from '../../package.json';

import {
  resolveBuildTimestamp,
  sanitizeDatabaseMetadata,
  withTimeout,
} from './admin-status-utils';
import { requireAdmin } from './api-utils';
import {
  getHarmonizationEngine,
  getProvidersWithCredentials,
} from './harmonization';

const SERVER_STARTED_AT = new Date().toISOString();
const STATUS_TIMEOUT_MS = 3_000;

export interface AdminStatus {
  application: {
    version: string;
    timestamp: string;
    timestampSource: 'deployment' | 'build' | 'server start';
    commit: string | null;
    environment: string;
    region: string | null;
  };
  packages: Array<{ name: string; version: string }>;
  database: {
    status: 'connected' | 'error' | 'not configured' | 'timeout';
    latencyMs: number | null;
    host: string;
    port: string;
    environment: 'local' | 'remote' | 'not configured' | 'invalid';
    message: string;
  };
  harmony: {
    status: 'online' | 'offline' | 'error' | 'timeout';
    enabledProviders: Array<{
      name: string;
      displayName: string;
      priority: number;
    }>;
    configuredProviders: string[];
    message: string;
  };
  authProviders: Array<{
    name: string;
    configured: boolean;
    purpose: string;
  }>;
}

function getApplicationStatus(): AdminStatus['application'] {
  const deployed = resolveBuildTimestamp(process.env, SERVER_STARTED_AT);
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  return {
    version: webPackage.version,
    timestamp: deployed.timestamp,
    timestampSource: deployed.source,
    commit: commit ? commit.slice(0, 12) : null,
    environment:
      process.env.VERCEL_ENV?.trim() || env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION?.trim() || null,
  };
}

function getPackageVersions(): AdminStatus['packages'] {
  return [
    { name: 'Next.js', version: webPackage.dependencies.next },
    { name: 'React', version: webPackage.dependencies.react },
    { name: '@scilent-one/auth', version: authPackage.version },
    { name: '@scilent-one/db', version: databasePackage.version },
    { name: '@scilent-one/harmony-engine', version: harmonyPackage.version },
    { name: '@scilent-one/logger', version: loggerPackage.version },
    { name: '@scilent-one/scilent-ui', version: scilentUiPackage.version },
    { name: '@scilent-one/ui', version: uiPackage.version },
  ];
}

function getAuthProviders(): AdminStatus['authProviders'] {
  return [
    {
      name: 'Email & password',
      configured: true,
      purpose: 'Primary sign-in',
    },
    {
      name: 'Spotify OAuth',
      configured: Boolean(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET),
      purpose: 'Streaming account linking',
    },
    {
      name: 'Tidal OAuth',
      configured: Boolean(env.TIDAL_CLIENT_ID && env.TIDAL_CLIENT_SECRET),
      purpose: 'Streaming account linking',
    },
  ];
}

async function checkDatabase(): Promise<AdminStatus['database']> {
  const metadata = sanitizeDatabaseMetadata(env.DATABASE_URL);
  if (!env.DATABASE_URL) {
    return {
      ...metadata,
      status: 'not configured',
      latencyMs: null,
      message: 'Database connection is not configured.',
    };
  }

  const startedAt = performance.now();

  try {
    await withTimeout(
      db.$queryRaw`SELECT 1`,
      STATUS_TIMEOUT_MS,
      'Database health check timed out'
    );

    return {
      ...metadata,
      status: 'connected',
      latencyMs: Math.round(performance.now() - startedAt),
      message: 'Database accepted a read-only health query.',
    };
  } catch (error) {
    const timedOut =
      error instanceof Error && error.message.includes('timed out');

    return {
      ...metadata,
      status: timedOut ? 'timeout' : 'error',
      latencyMs: null,
      message: timedOut
        ? 'Database did not respond within 3 seconds.'
        : 'Database health query failed.',
    };
  }
}

async function checkHarmony(): Promise<AdminStatus['harmony']> {
  const configuredProviders = Array.from(getProvidersWithCredentials());

  try {
    const engine = await withTimeout(
      getHarmonizationEngine(),
      STATUS_TIMEOUT_MS,
      'Harmony engine initialization timed out'
    );
    const enabledProviders = engine.getEnabledProviders().map((provider) => ({
      name: provider.name,
      displayName: provider.displayName,
      priority: provider.priority,
    }));

    return {
      status: enabledProviders.length > 0 ? 'online' : 'offline',
      enabledProviders,
      configuredProviders,
      message:
        enabledProviders.length > 0
          ? `${enabledProviders.length} metadata provider${enabledProviders.length === 1 ? '' : 's'} enabled.`
          : 'No metadata providers are enabled.',
    };
  } catch (error) {
    const timedOut =
      error instanceof Error && error.message.includes('timed out');

    return {
      status: timedOut ? 'timeout' : 'error',
      enabledProviders: [],
      configuredProviders,
      message: timedOut
        ? 'Harmony engine did not initialize within 3 seconds.'
        : 'Harmony engine status could not be collected.',
    };
  }
}

export async function collectAdminStatus(): Promise<AdminStatus> {
  await requireAdmin();

  const [databaseResult, harmonyResult] = await Promise.allSettled([
    checkDatabase(),
    checkHarmony(),
  ]);

  const database =
    databaseResult.status === 'fulfilled'
      ? databaseResult.value
      : {
          ...sanitizeDatabaseMetadata(env.DATABASE_URL),
          status: 'error' as const,
          latencyMs: null,
          message: 'Database status could not be collected.',
        };
  const harmony =
    harmonyResult.status === 'fulfilled'
      ? harmonyResult.value
      : {
          status: 'error' as const,
          enabledProviders: [],
          configuredProviders: Array.from(getProvidersWithCredentials()),
          message: 'Harmony engine status could not be collected.',
        };

  return {
    application: getApplicationStatus(),
    packages: getPackageVersions(),
    database,
    harmony,
    authProviders: getAuthProviders(),
  };
}
