# @scilent-one/db

## 0.6.0

### Minor Changes

- 6a1c026: Add ProfileType enum with USER, VOICE, and ARTIST values. Add profileType field to User model with default value of USER. Export ProfileType type for downstream packages.
- 64296ac: Enable Better Auth admin plugin (roles + user impersonation) and seed mock users with basic profiles for local development. Adds admin schema fields, `db:seed`, and Admin → Users impersonate/stop-impersonate UI with middleware and layout guards.
- 6d20372: Add review visibility (public/private) support.

  - `@scilent-one/db`: new `PostVisibility` enum and `Post.visibility` column (defaults to `PUBLIC`) plus a migration and index.
  - `@scilent-one/social`: `createReview`/`updateReview` accept `visibility`, new `setReviewVisibility` mutation, and a shared `visibilityWhere` filter enforced across every review/post read path (reviews, post-by-id, posts-by-author, liked/reposted posts, and the home/explore/profile feeds) so private reviews are only ever returned to their author.
  - `@scilent-one/ui`: `PostCard` gains `visibility` + `onToggleVisibility` for an owner "Make private/public" menu item.
  - `@scilent-one/scilent-ui`: `ReviewComposer` gains an animated eye visibility toggle, and `ReviewCard` shows a private badge with subtle styling for private reviews.

- 73187e2: Add music reviews as a post type with ReviewSubject attachments, review composer UI, artwork fallback utilities, and review APIs.

### Patch Changes

- 71e1c8d: Allow optional `DATABASE_POOL_MAX` (and a conservative production default of 5) when constructing the Prisma `PrismaPg` adapter pool for serverless-friendly connection limits.

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

- a011feb: Persist the selected color palette per user. The `User` model gains a `palette`
  field (defaults to `default`), exposed on the session via Better Auth
  `additionalFields` and settable through `authClient.updateUser({ palette })`
  (client typing via `inferAdditionalFields`).

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

- Updated dependencies
  - @scilent-one/logger@0.2.1

## 0.3.1

### Patch Changes

- c98f668: Artist follows update and autogen usernames
- af1ae2c: Unit tests (UI, HUI)
- 6a6a068: Unit tests (social)
- af1ae2c: Unit tests (HUI, UI)
- d0acd8a: Adds logging to Auth flow and Auth, DB packages
- Updated dependencies [01f7fde]
- Updated dependencies [d0acd8a]
  - @scilent-one/logger@0.2.0

## 0.3.0

### Minor Changes

- dd3fbae: Replaces RTF editor

## 0.2.0

### Minor Changes

- 57e37c7: Adds support for RTF posts
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

- 30e15c5: RTF support

## 0.1.1

### Patch Changes

- 77241d6: ALL: Init and configured changesets for versioning. DB: Removed postinstall script.
