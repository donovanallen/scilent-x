import * as React from 'react';
import { cn } from '@scilent-one/ui';
import {
  type IconVariant,
  type IconColor,
  type ProviderSpecificIconProps,
  type ProviderIconMetadata,
  resolveSize,
} from './types';

/** Aspect ratios for different Tidal variants */
const ASPECT_RATIOS = {
  icon: 1, // Square
  wordmark: 900 / 160, // Wide horizontal (~5.6)
  'wordmark-vertical': 320 / 480, // Tall vertical (~0.67)
} as const;

/** PNG asset paths for Tidal icons */
const PNG_PATHS = {
  icon: {
    black: '/tidal/icon-black.png',
    white: '/tidal/icon-white.png',
  },
  wordmark: {
    black: '/tidal/wordmark-black.png',
    white: '/tidal/wordmark-white.png',
  },
  'wordmark-vertical': {
    black: '/tidal/wordmark-vertical-black.png',
    white: '/tidal/wordmark-vertical-white.png',
  },
} as const;

export interface TidalIconProps extends ProviderSpecificIconProps {}

/**
 * Tidal provider icon component
 *
 * Renders the official Tidal icon or wordmark as a PNG image.
 * Note: Tidal does not provide official SVG assets, so this component
 * uses PNG images and does not support `color="current"` or dynamic fill colors.
 *
 * Available variants:
 * - `icon`: Square Tidal logo mark
 * - `wordmark`: Horizontal "TIDAL" text logo
 * - `wordmark-vertical`: Vertical stacked "TIDAL" logo
 *
 * @example
 * ```tsx
 * // Black icon on light background
 * <TidalIcon size="lg" color="black" />
 *
 * // White wordmark for dark backgrounds
 * <TidalIcon variant="wordmark" color="white" size={32} />
 *
 * // Vertical wordmark
 * <TidalIcon variant="wordmark-vertical" color="black" size={64} />
 * ```
 */
export function TidalIcon({
  variant = 'icon',
  color = 'black',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: TidalIconProps) {
  const resolvedSize = resolveSize(size);

  // Tidal doesn't have a brand color variant - default to black
  // Also doesn't support currentColor since we're using PNGs
  const effectiveColor = color === 'brand' || color === 'current' ? 'black' : color;

  if (process.env.NODE_ENV === 'development') {
    if (color === 'brand') {
      console.warn(
        'TidalIcon: color="brand" is not available. Tidal uses black/white variants. Falling back to "black".'
      );
    }
    if (color === 'current') {
      console.warn(
        'TidalIcon: color="current" is not supported for PNG-based icons. Falling back to "black".'
      );
    }
  }

  const aspectRatio = ASPECT_RATIOS[variant];
  const src = PNG_PATHS[variant][effectiveColor];

  // Calculate dimensions based on variant orientation
  let width: number;
  let height: number;

  if (variant === 'wordmark-vertical') {
    // For vertical wordmark, size is the height
    height = resolvedSize;
    width = Math.round(height * aspectRatio);
  } else {
    // For icon and horizontal wordmark, size is the height
    height = resolvedSize;
    width = Math.round(height * aspectRatio);
  }

  const defaultLabel =
    variant === 'icon'
      ? 'Tidal icon'
      : variant === 'wordmark'
        ? 'Tidal'
        : 'Tidal logo';

  return (
    <img
      src={src}
      alt={ariaLabel ?? defaultLabel}
      width={width}
      height={height}
      className={cn('shrink-0 object-contain', className)}
      role="img"
      aria-hidden={ariaHidden}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Metadata about Tidal icon availability */
export const tidalIconMetadata: ProviderIconMetadata = {
  provider: 'tidal',
  supportedVariants: ['icon', 'wordmark', 'wordmark-vertical'],
  supportedColors: {
    icon: ['black', 'white'],
    wordmark: ['black', 'white'],
    'wordmark-vertical': ['black', 'white'],
  },
  availableFormats: {
    icon: ['png'],
    wordmark: ['png'],
    'wordmark-vertical': ['png'],
  },
};

/**
 * Get URL to Tidal icon PNG asset
 */
export function getTidalIconUrl(
  variant: IconVariant = 'icon',
  color: Exclude<IconColor, 'current' | 'brand'> = 'black'
): string {
  const effectiveColor = color === 'black' || color === 'white' ? color : 'black';
  return PNG_PATHS[variant][effectiveColor];
}
