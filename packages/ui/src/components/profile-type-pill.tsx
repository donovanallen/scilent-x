import * as React from 'react';
import { cn, Badge } from './index';
import type { ProfileType } from '@scilent-one/db';

/**
 * Labels for each profile type - human-readable display names
 */
export const profileTypeLabels: Record<ProfileType, string> = {
  USER: 'User',
  VOICE: 'Verified Voice',
  ARTIST: 'Artist',
};

/**
 * Colors for each profile type variant
 */
export const profileTypeColors: Record<ProfileType, string> = {
  USER: 'bg-muted text-muted-foreground',
  VOICE: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
  ARTIST:
    'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100',
};

export interface ProfileTypePillProps extends Omit<
  React.ComponentProps<typeof Badge>,
  'children'
> {
  /** The profile type to display */
  profileType: ProfileType | string;
  /** Whether to show the label in uppercase */
  uppercase?: boolean | undefined;
}

/**
 * A pill/badge component that displays the profile type with consistent styling.
 * Use this instead of raw Badge components for profile types to ensure
 * consistent labeling across the application.
 *
 * @example
 * ```tsx
 * <ProfileTypePill profileType="USER" />
 * <ProfileTypePill profileType="VOICE" variant="secondary" />
 * <ProfileTypePill profileType="ARTIST" uppercase />
 * ```
 */
export function ProfileTypePill({
  profileType,
  uppercase = false,
  className,
  ...props
}: ProfileTypePillProps) {
  const label = profileTypeLabels[profileType as ProfileType] ?? profileType;
  const color = profileTypeColors[profileType as ProfileType];

  return (
    <Badge
      className={cn(color, uppercase && 'uppercase tracking-wider', className)}
      {...props}
    >
      {label}
    </Badge>
  );
}

/**
 * Get the display label for a profile type.
 * This function is useful when you need just the label text
 * without the badge styling.
 *
 * @param profileType - The profile type to get a label for
 * @returns The human-readable label for the profile type
 *
 * @example
 * ```tsx
 * <p>{getProfileTypeLabel("VOICE")}</p> // "Verified Voice"
 * ```
 */
export function getProfileTypeLabel(profileType: ProfileType | string): string {
  return profileTypeLabels[profileType as ProfileType] ?? profileType;
}
