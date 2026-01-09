---
"@scilent-one/auth": minor
"@scilent-one/social": patch
"@scilent-one/ui": patch
"web": minor
---

Add Tidal OAuth account linking integration

- Add genericOAuth plugin to auth server for Tidal OAuth support
- Add genericOAuthClient plugin to auth client for linkSocial/unlinkAccount methods
- Add Connected Accounts section to Settings page for linking streaming services
- Add connectedPlatforms prop to ProfileHeader component for displaying linked accounts
- Update user API endpoints to include connected accounts in response
- Add Connected column to Admin Users page showing linked streaming services
