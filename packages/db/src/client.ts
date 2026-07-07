import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createLogger } from '@scilent-one/logger';

const logger = createLogger('db:prisma');
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Prisma Client Singleton (Lazy Initialization)
 *
 * This creates a single instance of PrismaClient that is reused across
 * the application. The client is lazily initialized on first access to
 * support graceful degradation when DATABASE_URL is not configured.
 *
 * Key features:
 * 1. Lazy initialization - client is only created when first accessed
 * 2. In development, persists across hot reloads via globalThis
 * 3. Throws a clear error if DATABASE_URL is missing when accessed
 * 4. Routes Prisma logs through the structured logger
 *
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
        'Please configure your database connection in .env file.'
    );
  }

  const adapter = new PrismaPg({ connectionString });

  // Configure Prisma logging to emit events instead of console output
  const client = new PrismaClient({
    adapter,
    log: isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'info' },
        ]
      : [{ emit: 'event', level: 'error' }],
  });

  // Route Prisma logs through our structured logger
  client.$on('query', (e) => {
    // In development with LOG_LEVEL=trace, show full queries
    // Otherwise just log at debug level with minimal info
    if (process.env.LOG_LEVEL === 'trace') {
      logger.trace('Query executed', {
        query: e.query,
        params: e.params,
        duration: e.duration,
      });
    } else {
      logger.debug('Query executed', {
        duration: e.duration,
        // Truncate long queries for readability
        query:
          e.query.length > 100 ? `${e.query.substring(0, 100)}...` : e.query,
      });
    }
  });

  client.$on('error', (e) => {
    logger.error('Database error', { message: e.message, target: e.target });
  });

  client.$on('warn', (e) => {
    logger.warn('Database warning', { message: e.message, target: e.target });
  });

  client.$on('info', (e) => {
    logger.info('Database info', { message: e.message, target: e.target });
  });

  logger.debug('Prisma client initialized');

  return client;
};

// Declare global type for the prisma client singleton
declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

/**
 * Lazily initialized database client.
 * The client is only created when first accessed, allowing graceful
 * handling of missing DATABASE_URL configuration.
 */
export const db = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop) {
    // Lazily create the client on first property access
    if (!globalThis.prisma) {
      globalThis.prisma = createPrismaClient();
    }
    return globalThis.prisma[prop as keyof typeof globalThis.prisma];
  },
});
