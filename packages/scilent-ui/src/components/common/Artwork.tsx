'use client';

import { cn } from '@scilent-one/ui';
import { Disc3 } from 'lucide-react';
import * as React from 'react';

export interface ArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const sizeClasses = {
  sm: 'size-10',
  md: 'size-16',
  lg: 'size-24',
  xl: 'size-32',
} as const;

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

export function Artwork({
  src,
  alt,
  size = 'md',
  rounded = 'md',
  className,
  ...props
}: ArtworkProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted flex-shrink-0',
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
          <Disc3 className="size-1/2 text-muted-foreground/40" />
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity duration-200',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
        </>
      )}
    </div>
  );
}
