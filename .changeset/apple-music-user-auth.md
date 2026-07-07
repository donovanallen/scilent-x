---
'@scilent-one/harmony-engine': minor
---

Add user-scoped support to the Apple Music provider. `AppleMusicProvider` now
implements `getCurrentUser` (returning the user's storefront as their profile,
since Apple Music has no public user profile) and `getFollowedArtists`
(returning the user's library artists, preferring linked catalog data). These
requests use Apple's two-token model: the developer token is minted internally
and the Music User Token is passed as the `accessToken`.
