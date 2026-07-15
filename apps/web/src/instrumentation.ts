/**
 * Validates env at Next.js server startup (Node runtime).
 * Build-time validation is triggered by the import in `next.config.ts`.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./env');
  }
}
