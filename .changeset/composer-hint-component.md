---
'@scilent-one/ui': minor
'@scilent-one/scilent-ui': minor
---

Add a `ComposerHint` component that shows one or more hint strings inset in a composer's text input, cross-fading between them (with `prefers-reduced-motion` support). Wire it through `TiptapEditor` and `PostForm` via a new `composerHints` prop, and have `ReviewComposer` default to `@`/`#` mention hints when the composer supports mentions. The static Tiptap placeholder is suppressed when `composerHints` is provided so the two don't overlap.
