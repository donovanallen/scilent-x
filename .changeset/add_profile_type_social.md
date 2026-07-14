---
'@scilent-one/social': minor
---

Add profileType field to UserProfile interface and all user-related types (PostWithAuthor, CommentWithAuthor, FollowWithUser, etc.). Add profileType to all user query selects. Add setProfileType(userId, profileType) mutation for admin profile type changes.
