# @scilent-one/social

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
