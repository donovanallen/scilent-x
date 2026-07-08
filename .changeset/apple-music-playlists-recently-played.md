---
'@scilent-one/harmony-engine': minor
---

Add `HarmonizedPlaylist` and `HarmonizedListenHistoryItem` types, plus
`getPlaylists`/`getRecentlyPlayed` hooks on `BaseProvider`. `AppleMusicProvider`
implements both: `getPlaylists` returns the user's library playlists (with an
`isPublic` flag, and an optional `publicOnly` filter), and `getRecentlyPlayed`
returns their recent listen history via `/v1/me/recent/played/tracks`. Both
use the same Music User Token-based user authentication as the existing
`getFollowedArtists` support.
