---
"@scilent-one/db": minor
"@scilent-one/social": minor
"@scilent-one/ui": minor
---

Add user and artist mentions support in comments

- Added `contentHtml` field to Comment model to store rich text content
- Created `SimpleTiptapEditor` component for compact mention-enabled comment input
- Updated comment mutations to parse HTML mentions using `parseHtmlMentions()`
- Updated `PostCardCommentInput` to use `SimpleTiptapEditor` with @user and #artist mentions
- Updated `CommentCard` to render rich text content with `RichTextContent`
- Added mention query callback props throughout comment components
