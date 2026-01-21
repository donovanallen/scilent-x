---
'@scilent-one/harmony-engine': minor
'@scilent-one/auth': minor
---

Add Spotify integration for user authentication and profile

- harmony-engine: Added user-authenticated API support to SpotifyProvider
  - `supportsUserAuth` getter for feature detection
  - `getCurrentUser()` to fetch user profile from Spotify /me endpoint
  - `getFollowedArtists()` with cursor-based pagination
  - `searchArtistsWithUserToken()` for user-authenticated artist search

- auth: Added Spotify OAuth configuration to genericOAuth plugin
  - Authorization and token URLs for Spotify OAuth flow
  - Scopes: user-read-private, user-read-email, user-follow-read
  - PKCE support enabled
  - User info mapping for Better Auth
