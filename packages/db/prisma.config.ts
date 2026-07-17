import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Prisma CLI operations need a direct connection. Keep DATABASE_URL as a
    // fallback for existing local environments linked by the Prisma CLI.
    url: process.env.DIRECT_URL ?? env('DATABASE_URL'),
  },
});
