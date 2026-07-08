# @scilent-one/social

## 0.5.0

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

### Patch Changes

- c97c049: Add unit tests for the remaining database-backed mutations/queries
  (comments, feeds, follows, likes, mentions, posts, users, conversations,
  messages), raising package coverage from ~22% to ~99% statements/lines
  (~94% branches). No runtime behavior changes.
- Updated dependencies [3ba4d08]
- Updated dependencies [81d78d4]
- Updated dependencies [a011feb]
  - @scilent-one/db@0.5.0

## 0.4.0

### Minor Changes

- 081f182: Add user and artist mentions support in comments

  - Added `contentHtml` field to Comment model to store rich text content
  - Created `SimpleTiptapEditor` component for compact mention-enabled comment input
  - Updated comment mutations to parse HTML mentions using `parseHtmlMentions()`
  - Updated `PostCardCommentInput` to use `SimpleTiptapEditor` with @user and #artist mentions
  - Updated `CommentCard` to render rich text content with `RichTextContent`
  - Added mention query callback props throughout comment components

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

- 336f53e: Comment/reply UX, styling, breadcrumbs, etc.
- Updated dependencies
- Updated dependencies [081f182]
  - @scilent-one/db@0.4.0

## 0.3.1

### Patch Changes

- 17c0c67: Add support for interactive Artist mentions in Posts
- af1ae2c: Unit tests (UI, HUI)
- 6a6a068: Unit tests (social)
- af1ae2c: Unit tests (HUI, UI)
- f94f082: Fix to user mentions in posts
- Updated dependencies [c98f668]
- Updated dependencies [af1ae2c]
- Updated dependencies [6a6a068]
- Updated dependencies [af1ae2c]
- Updated dependencies [d0acd8a]
  - @scilent-one/db@0.3.1

## 0.3.0

### Minor Changes

- dd3fbae: Replaces RTF editor

### Patch Changes

- c067024: Fix user mention search to include user IDs in search query alongside usernames and names
- 3d61287: Adds support for Tidal account sync
- 0273008: Tidal OAuth update
- 3f688ca: Tidal oauth fixes
- ee04bd1: Add Tidal OAuth account linking integration
  - Add genericOAuth plugin to auth server for Tidal OAuth support
  - Add genericOAuthClient plugin to auth client for linkSocial/unlinkAccount methods
  - Add Connected Accounts section to Settings page for linking streaming services
  - Add connectedPlatforms prop to ProfileHeader component for displaying linked accounts
  - Update user API endpoints to include connected accounts in response
  - Add Connected column to Admin Users page showing linked streaming services

- Updated dependencies [dd3fbae]
  - @scilent-one/db@0.3.0

## 0.2.0

### Minor Changes

- c1ee10a: Adds social package and updates to db
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

- 57e37c7: Adds support for RTF posts
- 30e15c5: RTF support
- Updated dependencies [57e37c7]
- Updated dependencies [c1ee10a]
- Updated dependencies [19da5e1]
- Updated dependencies [30e15c5]
  - @scilent-one/db@0.2.0
