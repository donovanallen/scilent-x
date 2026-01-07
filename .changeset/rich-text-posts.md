---
'@scilent-one/ui': minor
'@scilent-one/db': minor
'@scilent-one/social': minor
---

Add rich-text formatting support for posts using QuillJS

- Add `contentHtml` field to Post model in database schema
- Create `RichTextEditor` component using Quill for rich-text editing
- Create `RichTextContent` component for rendering rich-text HTML
- Update `PostForm` to use the new rich-text editor
- Update `PostCard` to render rich-text content with styling
- Add Quill and react-quill-new dependencies to UI package
- Add rich-text CSS styles for editor and content rendering
