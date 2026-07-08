---
'@scilent-one/db': minor
'@scilent-one/social': minor
'@scilent-one/ui': minor
---

Add a basic direct-message inbox. `packages/db` gains `Conversation`,
`ConversationParticipant`, and `Message` models (1:1 conversations only, with
`lastReadAt`-based unread tracking). `packages/social` adds `conversations/`
and `messages/` domain modules — `getInboxConversations`, `getConversationById`,
`getConversationSummary`, `getOrCreateDirectConversation`, `markConversationRead`,
`getMessages`, and `sendMessage` — gated so a conversation can only be started
between mutual followers (`isMutualFollow`), and exposes `canMessage` on
`UserProfile`. `packages/ui` adds presentational messaging components
(`ConversationListItem`, `ConversationList`, `MessageBubble`, `MessageThread`,
`MessageComposer`) plus Storybook stories, and `ProfileHeader` gains an
optional `canMessage`/`onMessage` "Message" action. Notifications and
real-time delivery are explicitly out of scope for this pass.
