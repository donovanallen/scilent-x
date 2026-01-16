/**
 * Provider Icons Module
 *
 * Official icons for supported music streaming providers.
 * Includes inline SVG components (Spotify, Apple Music) and PNG-based
 * components (Tidal) with consistent APIs.
 *
 * @example
 * ```tsx
 * import { ProviderIcon, SpotifyIcon, AppleMusicIcon, TidalIcon } from '@scilent-one/scilent-ui';
 *
 * // Use the unified component for dynamic provider selection
 * <ProviderIcon provider="spotify" size="lg" color="brand" />
 *
 * // Or use provider-specific components for better tree-shaking
 * <SpotifyIcon variant="wordmark" color="white" />
 * ```
 */

// Types
export {
  type Provider,
  type IconVariant,
  type IconColor,
  type IconSize,
  type IconFormat,
  type BaseIconProps,
  type ProviderIconProps,
  type ProviderSpecificIconProps,
  type ProviderIconMetadata,
  SIZE_PRESETS,
  PROVIDER_LABELS,
  PROVIDER_BRAND_COLORS,
  resolveSize,
  resolveFillColor,
} from './types';

// Base component
export {
  ProviderIcon,
  PROVIDER_METADATA,
  getSupportedProviders,
  isProviderSupported,
  getProviderIconMetadata,
} from './ProviderIcon';

// Provider-specific components
export {
  SpotifyIcon,
  spotifyIconMetadata,
  getSpotifyIconUrl,
  type SpotifyIconProps,
} from './SpotifyIcon';

export {
  AppleMusicIcon,
  appleMusicIconMetadata,
  getAppleMusicIconUrl,
  type AppleMusicIconProps,
} from './AppleMusicIcon';

export {
  TidalIcon,
  tidalIconMetadata,
  getTidalIconUrl,
  type TidalIconProps,
} from './TidalIcon';
