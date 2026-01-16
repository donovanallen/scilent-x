# @scilent-one/auth

## 0.2.1

### Patch Changes

- c98f668: Artist follows update and autogen usernames
- d0acd8a: Adds logging to Auth flow and Auth, DB packages
- Updated dependencies [01f7fde]
- Updated dependencies [c98f668]
- Updated dependencies [af1ae2c]
- Updated dependencies [6a6a068]
- Updated dependencies [af1ae2c]
- Updated dependencies [d0acd8a]
  - @scilent-one/logger@0.2.0
  - @scilent-one/db@0.3.1

## 0.2.0

### Minor Changes

- 3d61287: Adds support for Tidal account sync
- ee04bd1: Add Tidal OAuth account linking integration
  - Add genericOAuth plugin to auth server for Tidal OAuth support
  - Add genericOAuthClient plugin to auth client for linkSocial/unlinkAccount methods
  - Add Connected Accounts section to Settings page for linking streaming services
  - Add connectedPlatforms prop to ProfileHeader component for displaying linked accounts
  - Update user API endpoints to include connected accounts in response
  - Add Connected column to Admin Users page showing linked streaming services

### Patch Changes

- 0273008: Tidal OAuth update
- 3f688ca: Tidal oauth fixes
- Updated dependencies [dd3fbae]
  - @scilent-one/db@0.3.0

## 0.1.4

### Patch Changes

- Updated dependencies [57e37c7]
- Updated dependencies [c1ee10a]
- Updated dependencies [19da5e1]
- Updated dependencies [30e15c5]
  - @scilent-one/db@0.2.0

## 0.1.3

### Patch Changes

- fae832e: Bugfixes and updates ;)

## 0.1.2

### Patch Changes

- 850a778: AUTH: implements email/pw auth

## 0.1.1

### Patch Changes

- 77241d6: ALL: Init and configured changesets for versioning. DB: Removed postinstall script.
- Updated dependencies [77241d6]
  - @scilent-one/db@0.1.1
