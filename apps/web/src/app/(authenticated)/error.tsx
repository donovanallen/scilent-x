'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Segment error boundary for authenticated routes.
 * Catches errors below the authenticated layout shell.
 */
export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Authenticated route error:', error);
  }, [error]);

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6 text-center'>
      <div className='flex size-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10'>
        <AlertTriangle className='size-6 text-destructive' />
      </div>
      <div className='flex max-w-sm flex-col items-center gap-2'>
        <h2 className='text-lg font-medium tracking-tight'>
          Something went wrong
        </h2>
        <p className='text-sm text-muted-foreground'>
          This page hit an unexpected error. You can try again, or head back to
          the feed.
        </p>
        {error.digest ? (
          <p className='mt-2 font-mono text-xs text-muted-foreground/60'>
            Error ID: {error.digest}
          </p>
        ) : null}
      </div>
      <button
        type='button'
        onClick={() => reset()}
        className='inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        <RotateCcw className='size-4' />
        Try again
      </button>
    </div>
  );
}
