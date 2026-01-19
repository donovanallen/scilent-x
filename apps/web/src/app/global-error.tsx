'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

import './globals.css';

/**
 * Global error boundary for unhandled errors.
 * Must be a Client Component and include its own html/body tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang='en' suppressHydrationWarning>
      <body className='antialiased bg-background text-foreground'>
        <div className='flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center'>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10'>
            <AlertTriangle className='size-6 text-destructive' />
          </div>
          <div className='flex max-w-sm flex-col items-center gap-2'>
            <h1 className='text-lg font-medium tracking-tight'>
              Something went wrong
            </h1>
            <p className='text-sm text-muted-foreground'>
              An unexpected error occurred. Please try again or contact support
              if the problem persists.
            </p>
            {error.digest && (
              <p className='mt-2 font-mono text-xs text-muted-foreground/60'>
                Error ID: {error.digest}
              </p>
            )}
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
      </body>
    </html>
  );
}
