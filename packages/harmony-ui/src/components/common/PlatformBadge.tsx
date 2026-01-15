import * as React from 'react';
import { cn, Badge } from '@scilent-one/ui';
import { ProviderIcon, isProviderSupported } from '../../icons/ProviderIcon';
import {
  type IconSize,
  type IconColor,
  type Provider,
} from '../../icons/types';

export type PlatformName =
  | 'spotify'
  | 'apple_music'
  | 'musicbrainz'
  | 'discogs'
  | 'deezer'
  | 'tidal'
  | 'amazon_music'
  | 'youtube_music'
  | 'soundcloud'
  | 'bandcamp'
  | string;

/** Display variant for the badge content */
export type PlatformBadgeDisplay = 'icon' | 'full' | 'text';

export interface PlatformBadgeProps extends Omit<
  React.ComponentProps<typeof Badge>,
  'children'
> {
  /** The platform/provider name */
  platform: PlatformName;
  /** Display mode: icon only, icon + text, or text only */
  display?: PlatformBadgeDisplay | undefined;
  /** Whether to show a colored background based on platform */
  colored?: boolean | undefined;
  /** Icon size override */
  iconSize?: IconSize | number | undefined;
  /** Icon color override */
  iconColor?: IconColor | undefined;
}

const platformLabels: Record<string, { full: string; short: string }> = {
  spotify: { full: 'Spotify', short: 'SP' },
  apple_music: { full: 'Apple Music', short: 'AM' },
  musicbrainz: { full: 'MusicBrainz', short: 'MB' },
  discogs: { full: 'Discogs', short: 'DC' },
  deezer: { full: 'Deezer', short: 'DZ' },
  tidal: { full: 'Tidal', short: 'TD' },
  amazon_music: { full: 'Amazon Music', short: 'AZ' },
  youtube_music: { full: 'YouTube Music', short: 'YT' },
  soundcloud: { full: 'SoundCloud', short: 'SC' },
  bandcamp: { full: 'Bandcamp', short: 'BC' },
};

const platformColors: Record<string, string> = {
  spotify: 'bg-[#1DB954] text-white hover:bg-[#1DB954]/90',
  apple_music: 'bg-[#FA243C] text-white hover:bg-[#FA243C]/90',
  musicbrainz: 'bg-[#BA478F] text-white hover:bg-[#BA478F]/90',
  discogs: 'bg-[#333333] text-white hover:bg-[#333333]/90',
  deezer: 'bg-[#FEAA2D] text-black hover:bg-[#FEAA2D]/90',
  tidal: 'bg-[#000000] text-white hover:bg-[#000000]/90',
  amazon_music: 'bg-[#00A8E1] text-white hover:bg-[#00A8E1]/90',
  youtube_music: 'bg-[#FF0000] text-white hover:bg-[#FF0000]/90',
  soundcloud: 'bg-[#FF5500] text-white hover:bg-[#FF5500]/90',
  bandcamp: 'bg-[#629AA9] text-white hover:bg-[#629AA9]/90',
};

/** Check if a platform has dark text on colored background */
const hasDarkText: Record<string, boolean> = {
  deezer: true,
};

export function PlatformBadge({
  platform,
  display = 'text',
  colored = false,
  iconSize = 'xs',
  iconColor,
  variant = 'secondary',
  className,
  ...props
}: PlatformBadgeProps) {
  const normalizedPlatform = platform.toLowerCase().replace(/[\s-]/g, '_');
  const labels = platformLabels[normalizedPlatform] || {
    full: platform,
    short: platform.slice(0, 2).toUpperCase(),
  };

  const hasIconSupport = isProviderSupported(normalizedPlatform);
  const colorClass = colored ? platformColors[normalizedPlatform] : undefined;

  // Determine icon color based on context
  const resolvedIconColor: IconColor =
    iconColor ??
    (colored
      ? hasDarkText[normalizedPlatform]
        ? 'black'
        : 'white'
      : 'current');

  // Render content based on display mode
  const renderContent = () => {
    // Icon-only mode
    if (display === 'icon') {
      if (hasIconSupport) {
        return (
          <ProviderIcon
            provider={normalizedPlatform as Provider}
            size={iconSize}
            color={resolvedIconColor}
            aria-label={labels.full}
          />
        );
      }
      // Fallback to abbreviated text for unsupported platforms
      return labels.short;
    }

    // Full mode (icon + text)
    if (display === 'full') {
      if (hasIconSupport) {
        return (
          <span className="inline-flex items-center gap-1.5">
            <ProviderIcon
              provider={normalizedPlatform as Provider}
              size={iconSize}
              color={resolvedIconColor}
              aria-hidden
            />
            <span>{labels.full}</span>
          </span>
        );
      }
      // Fallback to text only for unsupported platforms
      return labels.full;
    }

    // Text-only mode (default)
    return labels.full;
  };

  return (
    <Badge
      variant={colored ? 'default' : variant}
      className={cn(colorClass, className)}
      {...props}
    >
      {renderContent()}
    </Badge>
  );
}

export interface PlatformBadgeListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of platform names to display */
  platforms: PlatformName[];
  /** Display mode for all badges */
  display?: PlatformBadgeDisplay | undefined;
  /** Whether to show colored backgrounds */
  colored?: boolean | undefined;
  /** Maximum number of badges to show before "+N more" */
  maxVisible?: number | undefined;
  /** Icon size for all badges */
  iconSize?: IconSize | number | undefined;
  /** Icon color for all badges */
  iconColor?: IconColor | undefined;
}

export function PlatformBadgeList({
  platforms,
  display = 'text',
  colored = false,
  maxVisible,
  iconSize,
  iconColor,
  className,
  ...props
}: PlatformBadgeListProps) {
  const visiblePlatforms =
    maxVisible && platforms.length > maxVisible
      ? platforms.slice(0, maxVisible)
      : platforms;
  const hiddenCount =
    maxVisible && platforms.length > maxVisible
      ? platforms.length - maxVisible
      : 0;

  return (
    <div className={cn('flex flex-wrap gap-1', className)} {...props}>
      {visiblePlatforms.map((platform) => (
        <PlatformBadge
          key={platform}
          platform={platform}
          display={display}
          colored={colored}
          iconSize={iconSize}
          iconColor={iconColor}
        />
      ))}
      {hiddenCount > 0 && <Badge variant="outline">+{hiddenCount}</Badge>}
    </div>
  );
}
