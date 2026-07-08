---
'@scilent-one/harmony-engine': minor
---

Provider `priority` now derives from the instance configuration instead of a
hardcoded class constant. `BaseProvider` exposes `priority` as a getter that
returns the configured `ProviderConfig.priority`, falling back to a new
`defaultPriority` declared on each provider class. Previously the `priority`
supplied via configuration (which the web app derives from the
`provider_settings` table) was ignored, so admin priority overrides never
affected `ProviderRegistry.getByPriority()` ordering, lookup fallback order, or
status reporting. Provider defaults are unchanged (MusicBrainz 100, Spotify 80,
Tidal 75, Apple Music 70).
