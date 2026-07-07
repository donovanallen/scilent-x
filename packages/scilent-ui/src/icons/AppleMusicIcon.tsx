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
import IconBrand from './assets/apple/icon-brand.svg';
import IconBlack from './assets/apple/icon-black.svg';
import IconWhite from './assets/apple/icon-white.svg';

/** Map of color to the appropriate SVG component */
const SVG_COMPONENTS = {
  brand: IconBrand,
  black: IconBlack,
  white: IconWhite,
} as const;

export interface AppleMusicIconProps extends ProviderSpecificIconProps {}

/**
 * Apple Music provider icon component
 *
 * Renders the official Apple Music icon as an inline SVG.
 * The brand variant includes the signature red gradient.
 * Supports brand, black, white, and currentColor fills.
 *
 * Note: Apple Music only provides an icon variant (no wordmark).
 *
 * @example
 * ```tsx
 * // Brand colored icon with gradient
 * <AppleMusicIcon size="lg" color="brand" />
 *
 * // White icon for dark backgrounds
 * <AppleMusicIcon color="white" size={32} />
 *
 * // Inherit text color
 * <AppleMusicIcon color="current" className="text-muted-foreground" />
 * ```
 */
export function AppleMusicIcon({
  variant = 'icon',
  color = 'brand',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: AppleMusicIconProps) {
  const resolvedSize = resolveSize(size);

  // Apple Music only has icon variant - warn in dev if other variants used
  if (process.env.NODE_ENV === 'development' && variant !== 'icon') {
    console.warn(
      `AppleMusicIcon: variant "${variant}" is not available. Only "icon" is supported. Falling back to "icon".`
    );
  }

  // Apple Music icon is square
  const height = resolvedSize;
  const width = resolvedSize;

  // For "current" color, we use the black SVG but override the fill
  const effectiveColor = color === 'current' ? 'black' : color;
  const SvgComponent = SVG_COMPONENTS[effectiveColor];

  // Determine fill color override for currentColor mode
  const fill = color === 'current' ? 'currentColor' : undefined;

  return (
    <SvgComponent
      width={width}
      height={height}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={ariaLabel ?? 'Apple Music icon'}
      aria-hidden={ariaHidden}
      style={fill ? { fill } : undefined}
    />
  );
}

/** Metadata about Apple Music icon availability */
export const appleMusicIconMetadata: ProviderIconMetadata = {
  provider: 'apple_music',
  supportedVariants: ['icon'],
  supportedColors: {
    icon: ['brand', 'black', 'white', 'current'],
    wordmark: [], // Not available
    'wordmark-vertical': [], // Not available
  },
  availableFormats: {
    icon: ['svg'],
    wordmark: [],
    'wordmark-vertical': [],
  },
};

/**
 * Get URL to Apple Music icon asset
 * Note: Apple Music only provides SVG format
 */
export function getAppleMusicIconUrl(
  variant: IconVariant = 'icon',
  color: Exclude<IconColor, 'current'> = 'brand'
): string | null {
  if (variant !== 'icon') return null;
  return `/apple/icon-${color}.svg`;
}
