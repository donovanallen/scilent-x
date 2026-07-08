# @scilent-one/auth

## 0.4.0

### Minor Changes

- a011feb: Persist the selected color palette per user. The `User` model gains a `palette`
  field (defaults to `default`), exposed on the session via Better Auth
  `additionalFields` and settable through `authClient.updateUser({ palette })`
  (client typing via `inferAdditionalFields`).

### Patch Changes

- Updated dependencies [3ba4d08]
- Updated dependencies [81d78d4]
- Updated dependencies [a011feb]
  - @scilent-one/db@0.5.0

## 0.3.0

### Minor Changes

- 248b89b: Add Spotify integration for user authentication and profile

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

### Patch Changes

- Routine dependency maintenance across the monorepo.

  - Updated all in-range dependencies to their latest minor/patch versions
    (Radix UI, Tiptap, Storybook, Vitest, Prisma, @typescript-eslint, Turbo, etc.)
  - Bumped `next` to 16.2.10, `react`/`react-dom` to 19.2.7, and `lucide-react`
    to 1.23.0 (fixed the one breaking change: the removed `Github` brand icon
    in a Storybook story)
  - Deliberately upgraded several majors after verifying no breaking impact:
    `date-fns` 3 -> 4, `pino` 9 -> 10, `zod` 3 -> 4 (updated `z.record()` calls
    to the new two-argument signature), `eslint` 9 -> 10, `chromatic` 13 -> 18,
    `vite` 7 -> 8, `@vitejs/plugin-react` 5 -> 6, `vite-plugin-svgr` 4 -> 5,
    `p-retry` 6 -> 8 (updated `onFailedAttempt` to the new `RetryContext` shape),
    `@types/node` 25 -> 26, `dotenv` 16 -> 17, `isomorphic-dompurify` 2 -> 3,
    `html-react-parser` 5 -> 6, and `eslint-import-resolver-typescript` 3 -> 4
  - Deferred the TypeScript 5.9 -> 6.0 major upgrade; see `docs/TODO.md` for
    the reason (deprecated `downlevelIteration` compiler option breaks the
    shared tsconfig base repo-wide)

- Updated dependencies
- Updated dependencies [081f182]
  - @scilent-one/db@0.4.0
  - @scilent-one/logger@0.2.1

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
