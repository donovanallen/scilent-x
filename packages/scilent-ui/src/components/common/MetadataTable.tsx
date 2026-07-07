import * as React from "react";
import { cn, Skeleton } from "@scilent-one/ui";

export interface MetadataItem {
  /** Label for the metadata field */
  label: string;
  /** Value to display (can be a string, number, or React node) */
  value: React.ReactNode;
  /** Optional key for React list rendering (defaults to label) */
  key?: string;
  /** Whether to use monospace font for the value */
  mono?: boolean;
  /** Whether to hide this item if value is empty/null/undefined */
  hideEmpty?: boolean;
}

export interface MetadataTableProps
  extends React.HTMLAttributes<HTMLDListElement> {
  /** Array of metadata items to display */
  items: MetadataItem[];
  /** Layout orientation */
  orientation?: "horizontal" | "vertical" | undefined;
  /** Size variant */
  size?: "sm" | "md" | "lg" | undefined;
  /** Whether to add dividers between items */
  divided?: boolean | undefined;
}

const sizeClasses = {
  sm: {
    label: "text-xs",
    value: "text-xs",
    gap: "gap-0.5",
  },
  md: {
    label: "text-sm",
    value: "text-sm",
    gap: "gap-1",
  },
  lg: {
    label: "text-sm",
    value: "text-base",
    gap: "gap-1.5",
  },
} as const;

export function MetadataTable({
  items,
  orientation = "vertical",
  size = "md",
  divided = false,
  className,
  ...props
}: MetadataTableProps) {
  const sizes = sizeClasses[size];

  // Filter out empty items if hideEmpty is true
  const visibleItems = items.filter((item) => {
    if (!item.hideEmpty) return true;
    return (
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ""
    );
  });

  if (orientation === "horizontal") {
    return (
      <dl
        className={cn(
          "flex flex-wrap items-center",
          divided ? "divide-x" : "gap-6",
          className
        )}
        {...props}
      >
        {visibleItems.map((item) => (
          <div
            key={item.key || item.label}
            className={cn(
              "flex flex-col",
              sizes.gap,
              divided && "px-4 first:pl-0 last:pr-0"
            )}
          >
            <dt
              className={cn(
                sizes.label,
                "text-muted-foreground font-medium"
              )}
            >
              {item.label}
            </dt>
            <dd
              className={cn(
                sizes.value,
                item.mono && "font-mono"
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={cn(
        "grid gap-3",
        divided && "divide-y",
        className
      )}
      {...props}
    >
      {visibleItems.map((item) => (
        <div
          key={item.key || item.label}
          className={cn(
            "flex justify-between items-start",
            sizes.gap,
            divided && "pt-3 first:pt-0"
          )}
        >
          <dt
            className={cn(
              sizes.label,
              "text-muted-foreground shrink-0"
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              sizes.value,
              "text-right",
              item.mono && "font-mono text-xs"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export interface MetadataGridProps
  extends React.HTMLAttributes<HTMLDListElement> {
  /** Array of metadata items to display */
  items: MetadataItem[];
  /** Number of columns */
  columns?: 2 | 3 | 4 | undefined;
  /** Size variant */
  size?: "sm" | "md" | "lg" | undefined;
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

export function MetadataGrid({
  items,
  columns = 2,
  size = "md",
  className,
  ...props
}: MetadataGridProps) {
  const sizes = sizeClasses[size];

  const visibleItems = items.filter((item) => {
    if (!item.hideEmpty) return true;
    return (
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ""
    );
  });

  return (
    <dl
      className={cn(
        "grid gap-4",
        columnClasses[columns],
        className
      )}
      {...props}
    >
      {visibleItems.map((item) => (
        <div
          key={item.key || item.label}
          className={cn("flex flex-col", sizes.gap)}
        >
          <dt
            className={cn(
              sizes.label,
              "text-muted-foreground"
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              sizes.value,
              "font-medium",
              item.mono && "font-mono text-xs"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export interface MetadataTableSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rows to show */
  rows?: number | undefined;
  /** Layout orientation */
  orientation?: "horizontal" | "vertical" | undefined;
}

export function MetadataTableSkeleton({
  rows = 4,
  orientation = "vertical",
  className,
  ...props
}: MetadataTableSkeletonProps) {
  if (orientation === "horizontal") {
    return (
      <div
        className={cn("flex gap-6", className)}
        {...props}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("grid gap-3", className)}
      {...props}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
