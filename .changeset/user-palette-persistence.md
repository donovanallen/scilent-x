---
'@scilent-one/auth': minor
'@scilent-one/db': minor
---

Persist the selected color palette per user. The `User` model gains a `palette`
field (defaults to `default`), exposed on the session via Better Auth
`additionalFields` and settable through `authClient.updateUser({ palette })`
(client typing via `inferAdditionalFields`).
