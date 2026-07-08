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
 * Note: Tidal does not provide official SVG assets or a colored brand mark, so
 * this component uses monochrome PNG images.
 *
 * Because the mark is monochrome, the default (`auto`) — as well as `brand` and
 * `current` — is theme-aware: it renders the black asset in light mode and the
 * white asset in dark mode so the logo never disappears against a low-contrast
 * background. Pass an explicit `black` or `white` to opt out of theme swapping.
 *
 * Available variants:
 * - `icon`: Square Tidal logo mark
 * - `wordmark`: Horizontal "TIDAL" text logo
 * - `wordmark-vertical`: Vertical stacked "TIDAL" logo
 *
 * @example
 * ```tsx
 * // Theme-aware (black in light mode, white in dark mode)
 * <TidalIcon size="lg" />
 *
 * // Force a fixed color (e.g. on a known background)
 * <TidalIcon variant="wordmark" color="white" size={32} />
 * ```
 */
export function TidalIcon({
  variant = 'icon',
  color = 'auto',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: TidalIconProps) {
  const resolvedSize = resolveSize(size);

  const aspectRatio = ASPECT_RATIOS[variant];
  const height = resolvedSize;
  const width = Math.round(height * aspectRatio);

  const defaultLabel =
    variant === 'icon'
      ? 'Tidal icon'
      : variant === 'wordmark'
        ? 'Tidal'
        : 'Tidal logo';
  const label = ariaLabel ?? defaultLabel;

  const sharedProps = {
    width,
    height,
    role: 'img' as const,
    'aria-hidden': ariaHidden,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };

  // Explicit black/white opt out of theme-aware swapping.
  if (color === 'black' || color === 'white') {
    return (
      <img
        {...sharedProps}
        src={PNG_PATHS[variant][color]}
        alt={label}
        className={cn('shrink-0 object-contain', className)}
      />
    );
  }

  // Theme-aware (auto/brand/current): Tidal ships only monochrome PNGs and this
  // app themes via CSS-variable tokens (not `dark:` utilities), so we use the
  // PNG's alpha as a CSS mask and paint it with `currentColor`. Pinning the text
  // color to `--foreground` (via `text-foreground`) means the mark tracks the
  // active theme automatically — legible in both light and dark mode, SSR-safe,
  // and with no hydration flash. The PNG color is irrelevant to a mask (only its
  // alpha matters), so either asset works as the source.
  const maskUrl = `url(${PNG_PATHS[variant].black})`;
  return (
    <span
      role="img"
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden}
      className={cn('inline-block shrink-0 text-foreground', className)}
      style={{
        width,
        height,
        backgroundColor: 'currentColor',
        WebkitMaskImage: maskUrl,
        maskImage: maskUrl,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}

/** Metadata about Tidal icon availability */
export const tidalIconMetadata: ProviderIconMetadata = {
  provider: 'tidal',
  supportedVariants: ['icon', 'wordmark', 'wordmark-vertical'],
  supportedColors: {
    icon: ['auto', 'black', 'white'],
    wordmark: ['auto', 'black', 'white'],
    'wordmark-vertical': ['auto', 'black', 'white'],
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
  const effectiveColor =
    color === 'black' || color === 'white' ? color : 'black';
  return PNG_PATHS[variant][effectiveColor];
}
