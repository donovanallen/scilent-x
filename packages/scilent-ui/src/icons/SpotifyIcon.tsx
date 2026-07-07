import * as React from 'react';
import { cn } from '@scilent-one/ui';
import {
  type IconVariant,
  type IconColor,
  type ProviderSpecificIconProps,
  type ProviderIconMetadata,
  resolveSize,
} from './types';

// Import SVGs as React components via SVGR
import IconBrand from './assets/spotify/icon-brand.svg';
import IconBlack from './assets/spotify/icon-black.svg';
import IconWhite from './assets/spotify/icon-white.svg';
import WordmarkBrand from './assets/spotify/wordmark-brand.svg';
import WordmarkBlack from './assets/spotify/wordmark-black.svg';
import WordmarkWhite from './assets/spotify/wordmark-white.svg';

/** Aspect ratios for proper scaling */
const ASPECT_RATIOS = {
  icon: 236.05 / 225.25, // ~1.05 (nearly square)
  wordmark: 823.46 / 225.25, // ~3.66 (wide)
} as const;

/** Map of variant + color to the appropriate SVG component */
const SVG_COMPONENTS = {
  icon: {
    brand: IconBrand,
    black: IconBlack,
    white: IconWhite,
  },
  wordmark: {
    brand: WordmarkBrand,
    black: WordmarkBlack,
    white: WordmarkWhite,
  },
} as const;

export interface SpotifyIconProps extends ProviderSpecificIconProps {}

/**
 * Spotify provider icon component
 *
 * Renders the official Spotify icon or wordmark as an inline SVG.
 * Supports brand, black, white, and currentColor fills.
 *
 * @example
 * ```tsx
 * // Brand colored icon
 * <SpotifyIcon size="lg" color="brand" />
 *
 * // White wordmark for dark backgrounds
 * <SpotifyIcon variant="wordmark" color="white" size={32} />
 *
 * // Inherit text color
 * <SpotifyIcon color="current" className="text-muted-foreground" />
 * ```
 */
export function SpotifyIcon({
  variant = 'icon',
  color = 'brand',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: SpotifyIconProps) {
  const resolvedSize = resolveSize(size);

  // wordmark-vertical is not available for Spotify, fall back to wordmark
  const effectiveVariant =
    variant === 'wordmark-vertical' ? 'wordmark' : variant;
  const aspectRatio = ASPECT_RATIOS[effectiveVariant];

  // Calculate dimensions maintaining aspect ratio
  const height = resolvedSize;
  const width = Math.round(height * aspectRatio);

  const isWordmark = effectiveVariant === 'wordmark';
  const defaultLabel = isWordmark ? 'Spotify' : 'Spotify icon';

  // For "current" color, we use the brand SVG but override the fill
  const effectiveColor = color === 'current' ? 'brand' : color;
  const SvgComponent = SVG_COMPONENTS[effectiveVariant][effectiveColor];

  // Determine fill color
  const fill = color === 'current' ? 'currentColor' : undefined;

  return (
    <SvgComponent
      width={width}
      height={height}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      aria-hidden={ariaHidden}
      style={fill ? { fill } : undefined}
    />
  );
}

/** Metadata about Spotify icon availability */
export const spotifyIconMetadata: ProviderIconMetadata = {
  provider: 'spotify',
  supportedVariants: ['icon', 'wordmark'],
  supportedColors: {
    icon: ['brand', 'black', 'white', 'current'],
    wordmark: ['brand', 'black', 'white', 'current'],
    'wordmark-vertical': [], // Not available
  },
  availableFormats: {
    icon: ['svg', 'png'],
    wordmark: ['svg', 'png'],
    'wordmark-vertical': [],
  },
};

/**
 * Get URL to Spotify icon PNG asset (for contexts where inline SVG isn't supported)
 */
export function getSpotifyIconUrl(
  variant: IconVariant = 'icon',
  color: Exclude<IconColor, 'current'> = 'brand'
): string | null {
  if (variant === 'wordmark-vertical') return null;
  const effectiveVariant = variant === 'icon' ? 'icon' : 'wordmark';
  return `/spotify/${effectiveVariant}-${color}.png`;
}
