# @scilent-one/ui

## 0.6.0

### Minor Changes

- 3ba4d08: Add a basic direct-message inbox. `packages/db` gains `Conversation`,
  `ConversationParticipant`, and `Message` models (1:1 conversations only, with
  `lastReadAt`-based unread tracking). `packages/social` adds `conversations/`
  and `messages/` domain modules — `getInboxConversations`, `getConversationById`,
  `getConversationSummary`, `getOrCreateDirectConversation`, `markConversationRead`,
  `getMessages`, and `sendMessage` — gated so a conversation can only be started
  between mutual followers (`isMutualFollow`), and exposes `canMessage` on
  `UserProfile`. `packages/ui` adds presentational messaging components
  (`ConversationListItem`, `ConversationList`, `MessageBubble`, `MessageThread`,
  `MessageComposer`) plus Storybook stories, and `ProfileHeader` gains an
  optional `canMessage`/`onMessage` "Message" action. Notifications and
  real-time delivery are explicitly out of scope for this pass.
- add1a19: Add a shared motion foundation and apply it across core UI primitives (Phase 1 of the global motion system).

  - Migrated from the deprecated `tailwindcss-animate` plugin to `tw-animate-css` (Tailwind v4-native, CSS-first).
  - Added a shared motion scale: named `duration-instant/fast/base/slow/slower` utilities and polished `ease-out`/`ease-in`/`ease-in-out` easing curves, wired through to both CSS transitions and `animate-in`/`animate-out` entrance/exit animations.
  - Added `useReducedMotion` and `useInViewport` hooks, plus a `Reveal` component for IntersectionObserver-based fade/slide-in-view reveals with a capped stagger delay (skipped entirely under `prefers-reduced-motion`).
  - Applied the new tokens to `Button` (press/hover feedback), `Dialog`, `Sheet`, `DropdownMenu`, `ContextMenu`, `Popover`, `HoverCard`, `Select`, `Tooltip` (consistent enter/exit timing), `Tabs`, `Switch`, and `Sidebar` (collapse/expand easing).
  - Replaced `Skeleton`'s flat pulse with a shimmer sweep, falling back to the pulse under reduced motion.
  - Standardized hover-lift/scale transitions across `AlbumArtwork`, `AlbumCard`, `TrackCard`, and `ArtistCard` on the shared tokens.
  - Applied the `Reveal` stagger pattern to the web app's search results grid and the social feed's post list (reference implementations).

  This is a visual-only, backwards-compatible change - no public component APIs changed shape (aside from the new `useReducedMotion`, `useInViewport`, and `Reveal` exports from `@scilent-one/ui`).

- a011feb: Add preset color palette support to the shared stylesheet. `globals.css` now
  includes a brand-forward `pro` palette via `[data-theme='pro']` and
  `[data-theme='pro'].dark` token blocks, layered on top of the existing default
  palette. Palette tokens are color-only for now; radius, shadow, and fonts still
  inherit the base tokens.
- 81d78d4: Add repost support and fix several posts-feature bugs:

  - Add a `Repost` model plus `repostPost`/`unrepostPost` mutations and
    `getUserReposts` query, with a `POST_REPOSTED` activity for the post author.
  - Persist artist (and other non-`USER`) mentions by making `Mention.userId`
    optional and adding `entityId`/`entityLabel` columns; posts now use the same
    HTML-based mention parser as comments so `#artist` mentions are saved.
  - Fix `POST_CREATED` activity fan-out to actually notify followers (it
    previously only notified the author).
  - Fix a pagination bug in `getLikedPosts` where the `Like` row's cursor id was
    leaking into the returned `Post.id`.
  - Fix the comment `PATCH` API route to persist `contentHtml`, and add inline
    comment editing UI (`CommentCard`/`CommentList`).
  - Add `PostCard`/`Feed` repost button, counts, and `isReposted` state.

## 0.5.0

### Minor Changes

- e2565e4: Design improvements, Track component updates
- 081f182: Add user and artist mentions support in comments

  - Added `contentHtml` field to Comment model to store rich text content
  - Created `SimpleTiptapEditor` component for compact mention-enabled comment input
  - Updated comment mutations to parse HTML mentions using `parseHtmlMentions()`
  - Updated `PostCardCommentInput` to use `SimpleTiptapEditor` with @user and #artist mentions
  - Updated `CommentCard` to render rich text content with `RichTextContent`
  - Added mention query callback props throughout comment components

### Patch Changes

- 411406f: Updates to Editor component and PlatformProfileCard
- 9583c33: A11y and test fixes
- e844788: New primary color
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

- d3ae508: Docs
- 1effcfd: A11y fix
- 336f53e: Comment/reply UX, styling, breadcrumbs, etc.

## 0.4.0

### Minor Changes

- dbcbbc6: Unit/UI/Accessibility/Visual testing for UI
- b2e96c9: ### Features
  - Add `Spinner` component from shadcn registry for loading indicators
  - Add `Empty` component from shadcn registry for empty state UI patterns
  - Add comprehensive Storybook stories for all components

  ### Improvements
  - Move all component stories to dedicated `stories/` folder for better organization
  - Add stories for 15+ components that were missing coverage:
    - Core: avatar, label, select, separator, skeleton, textarea, toggle, toggle-group, tooltip, collapsible
    - Overlay: dropdown-menu, popover, hover-card, sheet, scroll-area
    - Social: user-avatar, user-card, follow-button, mention-text

  ### Accessibility Fixes
  - Fix primary color contrast ratio (3.05 → 5.0+) for WCAG AA compliance
  - Fix destructive color contrast with proper foreground color
  - Fix muted-foreground contrast ratio (4.38 → 5.0+)
  - Add `tabIndex` to ScrollArea viewport for keyboard accessibility
  - Add automatic `aria-label` to FollowButton when `iconOnly` is true

  All 176 Storybook accessibility tests now pass.

### Patch Changes

- 1479e4a: Dependency update
- 1094f0e: Minor dependency updates

## 0.3.1

### Patch Changes

- 17c0c67: Add support for interactive Artist mentions in Posts
- c98f668: Artist follows update and autogen usernames
- c087095: Removes font weight from heading defaults
- af1ae2c: Unit tests (UI, HUI)
- af1ae2c: Unit tests (HUI, UI)
- da2c4a8: Adds support for Provider cUser
- f94f082: Fix to user mentions in posts
- f7ed7e3: Fixes post edit functionality

## 0.3.0

### Minor Changes

- dd3fbae: Replaces RTF editor

### Patch Changes

- 3d61287: Adds support for Tidal account sync
- 7ea8b69: Styling updates to HoverPreviews and UserCard
- 0273008: Tidal OAuth update
- 3f688ca: Tidal oauth fixes
- ee04bd1: Add Tidal OAuth account linking integration
  - Add genericOAuth plugin to auth server for Tidal OAuth support
  - Add genericOAuthClient plugin to auth client for linkSocial/unlinkAccount methods
  - Add Connected Accounts section to Settings page for linking streaming services
  - Add connectedPlatforms prop to ProfileHeader component for displaying linked accounts
  - Update user API endpoints to include connected accounts in response
  - Add Connected column to Admin Users page showing linked streaming services

## 0.2.0

### Minor Changes

- 19da5e1: Add rich-text formatting support for posts using QuillJS
  - Add `contentHtml` field to Post model in database schema
  - Create `RichTextEditor` component using Quill for rich-text editing
  - Create `RichTextContent` component for rendering rich-text HTML
  - Update `PostForm` to use the new rich-text editor with proper state clearing
  - Update `PostCard` to render rich-text content with styling
  - Add HTML sanitization using DOMPurify for security
  - Add Quill CSS styles imported statically to prevent FOUC
  - Add accessibility features (aria-labels, focus-visible styles)
    Add rich-text formatting support for posts using QuillJS
  - Add `contentHtml` field to Post model in database schema
  - Create `RichTextEditor` component using Quill for rich-text editing
  - Create `RichTextContent` component for rendering rich-text HTML
  - Update `PostForm` to use the new rich-text editor
  - Update `PostCard` to render rich-text content with styling
  - Add Quill and react-quill-new dependencies to UI package
  - Add rich-text CSS styles for editor and content rendering

### Patch Changes

- 4ccafdb: Enables search by by artist, release and track
- 3e8c1e0: HUI: various UI updates; UI: Toggle styling
- 8f5cc5a: Adds Harmony IX
- 57e37c7: Adds support for RTF posts
- 9878cbd: Add Artist and Track search functionality; UI: related components
- c1ee10a: Adds social package and updates to db
- 30e15c5: RTF support

## 0.1.2

### Patch Changes

- 57e05c8: Adds new components (UI), updates linting (Tooling)

## 0.1.1

### Patch Changes

- 77241d6: ALL: Init and configured changesets for versioning. DB: Removed postinstall script.
- 8e26dc4: Updates fonts and typescale
