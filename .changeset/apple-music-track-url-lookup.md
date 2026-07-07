---
'@scilent-one/harmony-engine': minor
---

Add track lookup by URL. `BaseProvider` now exposes `lookupTrackById` and
`lookupTrackByUrl` (with an opt-in `_lookupTrackById` hook, defaulting to no-op),
the `LookupCoordinator` and `HarmonizationEngine` gain `lookupTrackByUrl`, and
the Apple Music provider implements `_lookupTrackById` (`GET /v1/catalog/{storefront}/songs/{id}`).
This makes Apple Music song links (both standalone `/song/` URLs and album URLs
with an `?i=<songId>` param) resolve to tracks, closing a gap where `parseUrl`
returned a track but nothing could look it up.
