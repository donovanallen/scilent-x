import * as React from "react";
import { cn, Skeleton, Card, CardContent, CardHeader } from "@scilent-one/ui";

/**
 * Grid skeleton for displaying a loading grid of cards
 */
export interface GridSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton items to show */
  count?: number | undefined;
  /** Number of columns */
  columns?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Aspect ratio of each card */
  aspectRatio?: "square" | "video" | "portrait" | undefined;
  /** Whether to show card content below the image */
  showContent?: boolean | undefined;
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
} as const;

const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
} as const;

export function GridSkeleton({
  count = 8,
  columns = 4,
  aspectRatio = "square",
  showContent = true,
  className,
  ...props
}: GridSkeletonProps) {
  return (
    <div
      className={cn("grid gap-4", columnClasses[columns], className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className={cn("w-full", aspectClasses[aspectRatio])} />
          {showContent && (
            <>
              <CardHeader className="p-3 pb-1">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1">
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

/**
 * List skeleton for displaying a loading list of items
 */
export interface ListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton items to show */
  count?: number | undefined;
  /** Whether to show an avatar/image */
  showAvatar?: boolean | undefined;
  /** Avatar shape */
  avatarShape?: "circle" | "square" | undefined;
  /** Number of text lines to show */
  lines?: 1 | 2 | 3 | undefined;
}

export function ListSkeleton({
  count = 5,
  showAvatar = true,
  avatarShape = "square",
  lines = 2,
  className,
  ...props
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && (
            <Skeleton
              className={cn(
                "h-12 w-12 shrink-0",
                avatarShape === "circle" ? "rounded-full" : "rounded-md"
              )}
            />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            {lines >= 2 && <Skeleton className="h-3 w-1/2" />}
            {lines >= 3 && <Skeleton className="h-3 w-2/3" />}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Hero skeleton for displaying a loading hero/header section
 */
export interface HeroSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a circular or square image */
  imageShape?: "circle" | "square" | undefined;
  /** Size of the hero image */
  imageSize?: "md" | "lg" | "xl" | undefined;
}

const imageSizeClasses = {
  md: "h-32 w-32",
  lg: "h-48 w-48",
  xl: "h-64 w-64",
} as const;

export function HeroSkeleton({
  imageShape = "square",
  imageSize = "lg",
  className,
  ...props
}: HeroSkeletonProps) {
  return (
    <div
      className={cn("flex flex-col md:flex-row gap-6", className)}
      {...props}
    >
      <Skeleton
        className={cn(
          imageSizeClasses[imageSize],
          "shrink-0",
          imageShape === "circle" ? "rounded-full" : "rounded-lg"
        )}
      />
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}

/**
 * Page skeleton for displaying a full page loading state
 */
export interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a hero section */
  showHero?: boolean | undefined;
  /** Whether to show a content grid */
  showGrid?: boolean | undefined;
  /** Whether to show a content list */
  showList?: boolean | undefined;
}

export function PageSkeleton({
  showHero = true,
  showGrid = false,
  showList = true,
  className,
  ...props
}: PageSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)} {...props}>
      {showHero && <HeroSkeleton />}
      {showGrid && <GridSkeleton count={8} />}
      {showList && <ListSkeleton count={10} />}
    </div>
  );
}

/**
 * Inline skeleton for inline loading states
 */
export interface InlineSkeletonProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Width of the skeleton */
  width?: string | number | undefined;
}

export function InlineSkeleton({
  width = "4rem",
  className,
  style,
  ...props
}: InlineSkeletonProps) {
  return (
    <Skeleton
      className={cn("inline-block h-4 align-middle", className)}
      style={{ width, ...style }}
      {...props}
    />
  );
}
