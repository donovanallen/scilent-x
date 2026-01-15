import { auth } from '@scilent-one/auth/server';
import { SocialError } from '@scilent-one/social';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { cache } from 'react';

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

export function handleApiError(error: unknown) {
  // Log error with structured context
  if (error instanceof Error) {
    apiLogger.error('API request failed', error, {
      errorType: error.constructor.name,
    });
  } else {
    apiLogger.error('API request failed', {
      error: String(error),
      errorType: 'unknown',
    });
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
