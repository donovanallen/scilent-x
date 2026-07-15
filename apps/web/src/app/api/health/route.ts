import { db } from '@scilent-one/db';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lightweight uptime probe: pings Postgres with `SELECT 1`.
 * No auth required so external monitors can hit `/api/health`.
 */
export async function GET() {
  const startedAt = performance.now();

  try {
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - startedAt);

    return NextResponse.json({
      status: 'ok',
      checks: {
        database: { status: 'ok', latencyMs },
      },
    });
  } catch {
    const latencyMs = Math.round(performance.now() - startedAt);

    return NextResponse.json(
      {
        status: 'error',
        checks: {
          database: { status: 'error', latencyMs },
        },
      },
      { status: 503 }
    );
  }
}
