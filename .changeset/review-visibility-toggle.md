---
'@scilent-one/db': minor
'@scilent-one/social': minor
'@scilent-one/ui': minor
'@scilent-one/scilent-ui': minor
---

Add review visibility (public/private) support.

- `@scilent-one/db`: new `PostVisibility` enum and `Post.visibility` column (defaults to `PUBLIC`) plus a migration and index.
- `@scilent-one/social`: `createReview`/`updateReview` accept `visibility`, new `setReviewVisibility` mutation, and a shared `visibilityWhere` filter enforced across every review/post read path (reviews, post-by-id, posts-by-author, liked/reposted posts, and the home/explore/profile feeds) so private reviews are only ever returned to their author.
- `@scilent-one/ui`: `PostCard` gains `visibility` + `onToggleVisibility` for an owner "Make private/public" menu item.
- `@scilent-one/scilent-ui`: `ReviewComposer` gains an animated eye visibility toggle, and `ReviewCard` shows a private badge with subtle styling for private reviews.
