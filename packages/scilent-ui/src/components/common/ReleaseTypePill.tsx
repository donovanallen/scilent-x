import * as React from "react";
import { cn, Badge } from "@scilent-one/ui";
import type { ReleaseType } from "../../types";

/**
 * Labels for each release type - human-readable display names
 */
export const releaseTypeLabels: Record<ReleaseType, string> = {
  album: "Album",
  single: "Single",
  ep: "EP",
  compilation: "Compilation",
  soundtrack: "Soundtrack",
  live: "Live",
  remix: "Remix",
  other: "Release",
};

/**
 * Plural labels for each release type - used in tabs, lists, etc.
 */
export const releaseTypePluralLabels: Record<ReleaseType | "all", string> = {
  all: "All",
  album: "Albums",
  single: "Singles",
  ep: "EPs",
  compilation: "Compilations",
  soundtrack: "Soundtracks",
  live: "Live",
  remix: "Remixes",
  other: "Other",
};

export interface ReleaseTypePillProps
  extends Omit<React.ComponentProps<typeof Badge>, "children"> {
  /** The release type to display */
  releaseType: ReleaseType | string;
  /** Whether to show the label in uppercase */
  uppercase?: boolean | undefined;
}

/**
 * A pill/badge component that displays the release type with consistent styling.
 * Use this instead of raw Badge components for release types to ensure
 * consistent labeling across the application.
 *
 * @example
 * ```tsx
 * <ReleaseTypePill releaseType="album" />
 * <ReleaseTypePill releaseType="single" variant="outline" />
 * <ReleaseTypePill releaseType="ep" uppercase />
 * ```
 */
export function ReleaseTypePill({
  releaseType,
  uppercase = false,
  variant = "secondary",
  className,
  ...props
}: ReleaseTypePillProps) {
  const label =
    releaseTypeLabels[releaseType as ReleaseType] ?? releaseType;

  return (
    <Badge
      variant={variant}
      className={cn(uppercase && "uppercase tracking-wider", className)}
      {...props}
    >
      {label}
    </Badge>
  );
}

/**
 * Get the display label for a release type.
 * This function is useful when you need just the label text
 * without the badge styling.
 *
 * @param releaseType - The release type to get a label for
 * @returns The human-readable label for the release type
 *
 * @example
 * ```tsx
 * <p>{getReleaseTypeLabel("album")}</p> // "Album"
 * ```
 */
export function getReleaseTypeLabel(releaseType: ReleaseType | string): string {
  return releaseTypeLabels[releaseType as ReleaseType] ?? releaseType;
}

/**
 * Get the plural display label for a release type.
 * This function is useful for tabs, lists, and headers.
 *
 * @param releaseType - The release type to get a plural label for
 * @returns The human-readable plural label for the release type
 *
 * @example
 * ```tsx
 * <TabsTrigger>{getReleaseTypePluralLabel("album")}</TabsTrigger> // "Albums"
 * ```
 */
export function getReleaseTypePluralLabel(
  releaseType: ReleaseType | "all" | string
): string {
  return (
    releaseTypePluralLabels[releaseType as ReleaseType | "all"] ?? releaseType
  );
}
