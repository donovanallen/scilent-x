/**
 * Provider Icons - Type Definitions
 *
 * Shared types and constants for the provider icon components.
 */

/** Supported music streaming providers */
export type Provider = 'spotify' | 'apple_music' | 'tidal';

/** Icon display variants */
export type IconVariant = 'icon' | 'wordmark' | 'wordmark-vertical';

/** Icon color options */
export type IconColor = 'brand' | 'black' | 'white' | 'current';

/** Preset size options */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Size preset values in pixels */
export const SIZE_PRESETS: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

/** Provider display names */
export const PROVIDER_LABELS: Record<Provider, string> = {
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  tidal: 'Tidal',
} as const;

/** Provider brand colors */
export const PROVIDER_BRAND_COLORS: Record<Provider, string> = {
  spotify: '#1DB954',
  apple_music: '#FA233B',
  tidal: '#000000',
} as const;

/** Base props shared by all provider icon components */
export interface BaseIconProps {
  /** Icon display variant */
  variant?: IconVariant;
  /** Icon color scheme */
  color?: IconColor;
  /** Icon size - preset name or pixel value */
  size?: IconSize | number;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** Hide from screen readers when decorative */
  'aria-hidden'?: boolean;
}

/** Props for the unified ProviderIcon component */
export interface ProviderIconProps extends BaseIconProps {
  /** The music streaming provider */
  provider: Provider;
}

/** Props for individual provider icon components */
export interface ProviderSpecificIconProps extends BaseIconProps {}

/** Available formats for icon assets */
export type IconFormat = 'svg' | 'png';

/** Metadata about available icon variants for a provider */
export interface ProviderIconMetadata {
  provider: Provider;
  supportedVariants: IconVariant[];
  supportedColors: Record<IconVariant, IconColor[]>;
  availableFormats: Record<IconVariant, IconFormat[]>;
}

/**
 * Resolves a size value to pixels
 */
export function resolveSize(size: IconSize | number | undefined): number {
  if (size === undefined) return SIZE_PRESETS.md;
  if (typeof size === 'number') return size;
  return SIZE_PRESETS[size];
}

/**
 * Gets the fill color value for an icon
 */
export function resolveFillColor(
  color: IconColor | undefined,
  provider: Provider
): string {
  switch (color) {
    case 'brand':
      return PROVIDER_BRAND_COLORS[provider];
    case 'black':
      return '#000000';
    case 'white':
      return '#FFFFFF';
    case 'current':
      return 'currentColor';
    default:
      return PROVIDER_BRAND_COLORS[provider];
  }
}
