---
'@scilent-one/ui': minor
---

Add profileType support across user-facing components. Extend UserAvatar with optional profileType prop that renders a corner badge for non-USER types. Add profileType to ProfileHeaderProps, UserCardProps, PostCardAuthor, and CommentCardAuthor interfaces. Render ProfileTypePill next to names in ProfileHeader, UserCard, PostCard, and CommentCard for non-USER profile types.
