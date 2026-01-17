import * as React from 'react';
import { type ProviderIconProps, type Provider } from './types';
import { SpotifyIcon, spotifyIconMetadata } from './SpotifyIcon';
import { AppleMusicIcon, appleMusicIconMetadata } from './AppleMusicIcon';
import { TidalIcon, tidalIconMetadata } from './TidalIcon';

/** Map of provider to their icon component */
const PROVIDER_COMPONENTS = {
  spotify: SpotifyIcon,
  apple_music: AppleMusicIcon,
  tidal: TidalIcon,
} as const;

/** Map of provider to their metadata */
export const PROVIDER_METADATA = {
  spotify: spotifyIconMetadata,
  apple_music: appleMusicIconMetadata,
  tidal: tidalIconMetadata,
} as const;

/**
 * Unified provider icon component
 *
 * A polymorphic component that renders the appropriate icon based on the provider.
 * This is the recommended entry point for rendering provider icons when you need
 * to dynamically switch between providers.
 *
 * For static usage where the provider is known at compile time, prefer using
 * the provider-specific components directly (SpotifyIcon, AppleMusicIcon, TidalIcon)
 * for better tree-shaking.
 *
 * @example
 * ```tsx
 * // Dynamic provider selection
 * <ProviderIcon provider={user.preferredProvider} size="lg" />
 *
 * // Iterate over multiple providers
 * {providers.map(provider => (
 *   <ProviderIcon key={provider} provider={provider} size="sm" color="current" />
 * ))}
 *
 * // With specific variant and color
 * <ProviderIcon provider="spotify" variant="wordmark" color="white" />
 * ```
 */
export function ProviderIcon({ provider, ...props }: ProviderIconProps) {
  const Component = PROVIDER_COMPONENTS[provider];

  if (!Component) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`ProviderIcon: Unknown provider "${provider}". Supported providers: ${Object.keys(PROVIDER_COMPONENTS).join(', ')}`);
    }
    return null;
  }

  return <Component {...props} />;
}

/**
 * Get list of all supported providers
 */
export function getSupportedProviders(): Provider[] {
  return Object.keys(PROVIDER_COMPONENTS) as Provider[];
}

/**
 * Check if a provider is supported
 */
export function isProviderSupported(provider: string): provider is Provider {
  return provider in PROVIDER_COMPONENTS;
}

/**
 * Get metadata for a specific provider's icon availability
 */
export function getProviderIconMetadata(provider: Provider) {
  return PROVIDER_METADATA[provider];
}
