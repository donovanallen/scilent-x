/**
 * Static, presentation-level metadata for the metadata providers surfaced on
 * the admin Harmony dashboard.
 *
 * This is intentionally a plain (non-`'use server'`) module so the values can be
 * imported by both server actions and React Server Components. Runtime state
 * (enabled/priority) lives in the `provider_settings` table; this only holds the
 * things that never change: display name, auth mechanism, and the built-in
 * default priority used before an admin overrides it.
 */

export interface ProviderMetadata {
  /** Internal provider identifier (matches the harmony-engine provider name). */
  name: string;
  /** Human-readable provider name. */
  displayName: string;
  /** Short description of how the provider authenticates. */
  authType: string;
  /**
   * Built-in default priority. Higher values are queried first. Mirrors the
   * `defaultPriority` declared on each harmony-engine provider class.
   */
  defaultPriority: number;
}

/**
 * Ordered list of the providers the harmony engine knows about. The order here
 * is only a stable fallback; the dashboard sorts providers by their effective
 * priority at render time.
 */
export const PROVIDER_METADATA: readonly ProviderMetadata[] = [
  {
    name: 'musicbrainz',
    displayName: 'MusicBrainz',
    authType: 'None (rate limited)',
    defaultPriority: 100,
  },
  {
    name: 'spotify',
    displayName: 'Spotify',
    authType: 'OAuth Client Credentials',
    defaultPriority: 80,
  },
  {
    name: 'tidal',
    displayName: 'Tidal',
    authType: 'OAuth Client Credentials',
    defaultPriority: 75,
  },
  {
    name: 'apple_music',
    displayName: 'Apple Music',
    authType: 'Developer Token (JWT)',
    defaultPriority: 70,
  },
] as const;

/** Fallback priority for any provider without an explicit default. */
export const FALLBACK_PROVIDER_PRIORITY = 50;

/** Inclusive lower bound for an admin-editable provider priority. */
export const MIN_PROVIDER_PRIORITY = 0;

/** Inclusive upper bound for an admin-editable provider priority. */
export const MAX_PROVIDER_PRIORITY = 100;

const DEFAULT_PRIORITY_BY_NAME = new Map(
  PROVIDER_METADATA.map((p) => [p.name, p.defaultPriority])
);

/** Get the built-in default priority for a provider name. */
export function getDefaultPriority(providerName: string): number {
  return (
    DEFAULT_PRIORITY_BY_NAME.get(providerName) ?? FALLBACK_PROVIDER_PRIORITY
  );
}

/** Clamp a priority value to the editable range as an integer. */
export function clampPriority(value: number): number {
  if (!Number.isFinite(value)) return FALLBACK_PROVIDER_PRIORITY;
  const rounded = Math.round(value);
  if (rounded < MIN_PROVIDER_PRIORITY) return MIN_PROVIDER_PRIORITY;
  if (rounded > MAX_PROVIDER_PRIORITY) return MAX_PROVIDER_PRIORITY;
  return rounded;
}
