---
'@scilent-one/harmony-engine': minor
---

Add an Apple Music catalog provider. `AppleMusicProvider` authenticates with a
MusicKit developer token (ES256 JWT minted from a Team ID, Key ID, and `.p8`
private key) and supports ISRC track lookup, UPC album lookup, catalog search
for releases/artists/tracks, and `music.apple.com` URL parsing. The provider is
registered under the `apple_music` name in the `ProviderRegistry`.
