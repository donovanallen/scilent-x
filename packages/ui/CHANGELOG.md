# @scilent-one/ui

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
