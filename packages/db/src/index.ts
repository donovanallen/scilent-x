/**
 * @scilent-one/db
 *
 * Database package providing Prisma client and type exports.
 *
 * @example
 * ```ts
 * import { db } from "@scilent-one/db";
 *
 * const users = await db.user.findMany();
 * ```
 */

// Export the singleton Prisma client
export { db } from './client';

// Re-export Prisma types for convenience
export { Prisma } from '../prisma/generated/client';

// Re-export generated types
export type {
  User,
  Account,
  Session,
  Verification,
} from '../prisma/generated/client.js';
