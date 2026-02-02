# @scilent-one/db

## 0.4.0

### Minor Changes

- 081f182: Add user and artist mentions support in comments
  - Added `contentHtml` field to Comment model to store rich text content
  - Created `SimpleTiptapEditor` component for compact mention-enabled comment input
  - Updated comment mutations to parse HTML mentions using `parseHtmlMentions()`
  - Updated `PostCardCommentInput` to use `SimpleTiptapEditor` with @user and #artist mentions
  - Updated `CommentCard` to render rich text content with `RichTextContent`
  - Added mention query callback props throughout comment components

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
