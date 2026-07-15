import { auth } from '@scilent-one/auth/server';
import { SocialError } from '@scilent-one/social';
import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { cache } from 'react';

import { isAdminUser } from './auth-guards';
import { apiLogger } from './logger';

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
});

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/** Throws if the current user does not have the Better Auth `admin` role. */
export async function requireAdmin() {
  const user = await requireAuth();
  if (!isAdminUser({ role: user.role ?? null })) {
    throw new Error('Forbidden');
  }
  return user;
}

export const getIsAdmin = cache(async () => {
  const user = await getCurrentUser();
  return isAdminUser({ role: user?.role ?? null });
});

export function handleApiError(error: unknown) {
  // Log error with structured context; report unexpected failures to Sentry
  // (auth/forbidden stay logged only — expected client errors).
  const skipSentry =
    error instanceof Error &&
    (error.message === 'Unauthorized' || error.message === 'Forbidden');

  if (error instanceof Error) {
    apiLogger.error('API request failed', error, {
      errorType: error.constructor.name,
    });
    if (!skipSentry) {
      Sentry.captureException(error);
    }
  } else {
    apiLogger.error('API request failed', {
      error: String(error),
      errorType: 'unknown',
    });
    if (!skipSentry) {
      Sentry.captureException(error);
    }
  }

  if (error instanceof SocialError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

export function parseSearchParams(request: Request): {
  cursor?: string;
  limit?: number;
} {
  const { searchParams } = new URL(request.url);
  const cursorParam = searchParams.get('cursor');
  const limitParam = searchParams.get('limit');

  // Construct object with explicit presence/absence of properties
  // to satisfy exactOptionalPropertyTypes
  if (cursorParam && limitParam) {
    return { cursor: cursorParam, limit: parseInt(limitParam, 10) };
  }
  if (cursorParam) {
    return { cursor: cursorParam };
  }
  if (limitParam) {
    return { limit: parseInt(limitParam, 10) };
  }
  return {};
}
