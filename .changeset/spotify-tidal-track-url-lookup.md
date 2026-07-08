---
'@scilent-one/harmony-engine': minor
---

Resolve Spotify and Tidal song links via `lookupTrackByUrl`. Both providers now
implement the `_lookupTrackById` hook (Spotify: `GET /tracks/{id}`; Tidal:
`GET /tracks/{id}` with `include=artists`), so their track URLs/URIs
(e.g. `https://open.spotify.com/track/...`, `https://tidal.com/browse/track/...`)
resolve to harmonized tracks instead of returning `null`. This extends the
track-URL lookup already supported by Apple Music to Spotify and Tidal.
