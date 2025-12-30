'use server';

import { db } from '@scilent-one/db';

export type DbStatus = 'connected' | 'error' | 'not_configured';

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
 * Return list of available database tables from Prisma schema
 */
export async function getDbTables(): Promise<DbTable[]> {
  // These are derived from the Prisma schema
  // In a more dynamic setup, you could introspect the database
  return [
    { name: 'users', displayName: 'User' },
    { name: 'accounts', displayName: 'Account' },
    { name: 'sessions', displayName: 'Session' },
    { name: 'verifications', displayName: 'Verification' },
  ];
}

/**
 * Get table row counts (only works when connected)
 */
export async function getTableCounts(): Promise<Record<string, number | null>> {
  try {
    const [userCount, accountCount, sessionCount, tokenCount] =
      await Promise.all([
        db.user.count(),
        db.account.count(),
        db.session.count(),
        db.verification.count(),
      ]);

    return {
      users: userCount,
      accounts: accountCount,
      sessions: sessionCount,
      verifications: tokenCount,
    };
  } catch {
    return {
      users: null,
      accounts: null,
      sessions: null,
      verifications: null,
    };
  }
}
