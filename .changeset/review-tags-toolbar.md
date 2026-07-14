---
'@scilent-one/scilent-ui': minor
'@scilent-one/ui': minor
---

Add a "Tags" toolbar to the review composer. Once a review subject is attached, a second toggle pill appears next to "Format" that reveals auto-generated (non-interactive) tag pills for the subject's artist and track/release name, plus a pill for each artist (`#`) mention added in the review body.

`TiptapEditor` (and `PostForm`) gain two new optional props to support this generically: `secondaryToolbar` (an extra toggle pill + collapsible content rendered next to "Format") and `onMentionsChange` (reports the user/artist mentions currently present in the editor). A new `ReviewTagsToolbar` component renders the pills.
