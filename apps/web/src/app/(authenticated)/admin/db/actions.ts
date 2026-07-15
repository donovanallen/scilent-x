'use server';

import { db } from '@scilent-one/db';

import { requireAdmin } from '@/lib/api-utils';
import { createActionDomainLogger, toLogError } from '@/lib/logger';

const log = createActionDomainLogger('admin-db');

export type DbStatus = 'connected' | 'error' | 'not_configured';

export interface AuthProviderInfo {
  id: string;
  name: string;
  type: 'email' | 'social' | 'oauth';
  configured: boolean;
}

export interface DbStatusResult {
  status: DbStatus;
  message: string;
  latencyMs?: number;
}

export interface DbMetadata {
  provider: string;
  host: string;
  port: string;
  database: string;
  isConfigured: boolean;
}

export interface DbTable {
  name: string;
  displayName: string;
}

/**
 * Test the database connection and return status
 */
export async function getDbStatus(): Promise<DbStatusResult> {
  await requireAdmin();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      status: 'not_configured',
      message: 'DATABASE_URL environment variable is not set',
    };
  }

  try {
    const start = Date.now();
    // Test connection with a simple query
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return {
      status: 'connected',
      message: 'Database connection successful',
      latencyMs,
    };
  } catch (error) {
    return {
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

/**
 * Parse DATABASE_URL and return sanitized metadata (no credentials)
 */
export async function getDbMetadata(): Promise<DbMetadata> {
  await requireAdmin();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      provider: 'PostgreSQL',
      host: 'Not configured',
      port: 'N/A',
      database: 'N/A',
      isConfigured: false,
    };
  }

  try {
    // Parse the connection string: postgresql://user:password@host:port/database
    const url = new URL(databaseUrl);

    return {
      provider: 'PostgreSQL',
      host: url.hostname || 'localhost',
      port: url.port || '5432',
      database: url.pathname.slice(1) || 'unknown', // Remove leading slash
      isConfigured: true,
    };
  } catch {
    return {
      provider: 'PostgreSQL',
      host: 'Invalid URL',
      port: 'N/A',
      database: 'N/A',
      isConfigured: false,
    };
  }
}

/**
 * Return list of available database tables by introspecting the database
 */
export async function getDbTables(): Promise<DbTable[]> {
  await requireAdmin();

  try {
    // Query PostgreSQL's information_schema to get all user tables
    const tables = await db.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    // Convert table names to display names
    return tables.map((row: { table_name: string }) => ({
      name: row.table_name,
      displayName: formatTableDisplayName(row.table_name),
    }));
  } catch (error) {
    log.error('Failed to introspect database tables', toLogError(error));
    return [];
  }
}

/**
 * Convert database table name to a display name
 * Examples: 'users' -> 'User', 'user_accounts' -> 'User Account'
 */
function formatTableDisplayName(tableName: string): string {
  return tableName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get table row counts for all tables dynamically
 */
export async function getTableCounts(): Promise<Record<string, number | null>> {
  await requireAdmin();

  try {
    // Get all tables dynamically
    const tables = await getDbTables();

    if (tables.length === 0) {
      return {};
    }

    // Count rows for each table using raw SQL queries
    // Note: Table names are validated (from information_schema) so safe to use
    const countPromises = tables.map(async (table) => {
      try {
        // Use $queryRawUnsafe with properly quoted table name
        // Since table names come from information_schema, they're safe
        // PostgreSQL requires double quotes for identifiers
        const query = `SELECT COUNT(*) as count FROM "${table.name}"`;
        const result =
          await db.$queryRawUnsafe<Array<{ count: bigint }>>(query);

        // Convert bigint to number
        return {
          tableName: table.name,
          count: Number(result[0]?.count ?? 0),
        };
      } catch (error) {
        log.error(`Failed to count rows for table ${table.name}`, toLogError(error));
        return {
          tableName: table.name,
          count: null,
        };
      }
    });

    const results = await Promise.all(countPromises);

    // Convert array to record
    return results.reduce(
      (acc, { tableName, count }) => {
        acc[tableName] = count;
        return acc;
      },
      {} as Record<string, number | null>
    );
  } catch (error) {
    log.error('Failed to get table counts', toLogError(error));
    return {};
  }
}

/**
 * Get configured authentication providers
 * Checks environment variables to determine which providers are configured
 */
export async function getAuthProviders(): Promise<AuthProviderInfo[]> {
  await requireAdmin();

  const providers: AuthProviderInfo[] = [
    // Email/Password - always configured if enabled in auth config
    {
      id: 'email',
      name: 'Email & Password',
      type: 'email',
      configured: true, // Enabled by default in auth config
    },
    // Social OAuth Providers
    {
      id: 'google',
      name: 'Google',
      type: 'social',
      configured: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'social',
      configured: Boolean(
        process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ),
    },
    {
      id: 'apple',
      name: 'Apple',
      type: 'social',
      configured: Boolean(
        process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ),
    },
    // Generic OAuth Providers (streaming services)
    {
      id: 'tidal',
      name: 'Tidal',
      type: 'oauth',
      configured: Boolean(
        process.env.TIDAL_CLIENT_ID && process.env.TIDAL_CLIENT_SECRET
      ),
    },
    {
      id: 'spotify',
      name: 'Spotify',
      type: 'oauth',
      configured: Boolean(
        process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET
      ),
    },
  ];

  return providers;
}
