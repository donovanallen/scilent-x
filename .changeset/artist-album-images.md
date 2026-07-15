---
'@scilent-one/harmony-engine': minor
'@scilent-one/scilent-ui': minor
---

Surface artist images and album/release artwork across the app.

- Add an `images` field to `HarmonizedArtist` and populate it from the Spotify,
  Tidal, and Apple Music provider transforms (previously dropped).
- Preserve artwork and artist images when merging results across providers so a
  high-confidence provider without covers (e.g. MusicBrainz) no longer clobbers
  another provider's artwork/images.
- Add a `getArtistImageUrl` helper for picking the best-resolution artist image.
- Render artist images in `ArtistCard`, `ArtistListItem`, `ArtistHeader`, and
  `ArtistHoverPreview`, falling back to the placeholder icon when none exist.
- Add a Cover Art Archive fallback (via `getReleaseArtworkFallbacks`) for
  MusicBrainz-only releases in the album card, list item, details, and hover
  preview, and give the shared `Artwork` component a fallback-source chain.
- Add an `artwork` field to `HarmonizedTrack`, derived from the track's parent
  release: Spotify and Apple Music populate it from the track/song payload,
  Tidal and the release-lookup path inherit it from the parent album. Render it
  in `TrackCard`, `TrackDetails`, and `TrackHoverPreview`, and resolve it for
  track review subjects.
