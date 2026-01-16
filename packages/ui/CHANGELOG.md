# @scilent-one/ui

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
