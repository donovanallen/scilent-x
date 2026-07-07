---
'@scilent-one/ui': minor
---

Add preset color palette support to the shared stylesheet. `globals.css` now
includes a brand-forward `pro` palette via `[data-theme='pro']` and
`[data-theme='pro'].dark` token blocks, layered on top of the existing default
palette. Palette tokens are color-only for now; radius, shadow, and fonts still
inherit the base tokens.
