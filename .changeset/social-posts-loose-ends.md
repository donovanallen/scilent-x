---
'@scilent-one/db': minor
'@scilent-one/social': minor
'@scilent-one/ui': minor
---

Add repost support and fix several posts-feature bugs:

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
