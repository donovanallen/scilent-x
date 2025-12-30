import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
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
