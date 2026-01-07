import * as React from "react";
import { cn, Skeleton } from "@scilent-one/ui";

export interface TrackArtworkProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** URL of the artwork image */
  src?: string | undefined;
  /** Alt text for the image */
  alt?: string | undefined;
  /** Size of the artwork */
  size?: "sm" | "md" | "lg" | undefined;
  /** Whether to show a loading skeleton */
  isLoading?: boolean | undefined;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

export function TrackArtwork({
  src,
  alt = "Track artwork",
  size = "md",
  isLoading = false,
  className,
  ...props
}: TrackArtworkProps) {
  const sizeClass = sizeClasses[size];

  if (isLoading) {
    return (
      <Skeleton
        className={cn(sizeClass, "rounded-md shrink-0", className)}
        {...props}
      />
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          sizeClass,
          "rounded-md bg-muted flex items-center justify-center shrink-0",
          className
        )}
        {...props}
      >
        <svg
          className="h-1/2 w-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(sizeClass, "rounded-md overflow-hidden shrink-0", className)}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
