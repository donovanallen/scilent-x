---
'@scilent-one/ui': minor
'@scilent-one/scilent-ui': patch
---

Add a themeable custom scrollbar system.

- New scrollbar design tokens (`--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-thumb-active`, `--scrollbar-track`, `--scrollbar-thumb-opacity`) derived from the palette so they adapt across light/dark and every theme.
- `custom-scrollbars` class applies a subtle, theme-aware native scrollbar (standard `scrollbar-*` properties plus `::-webkit-scrollbar` fallback) with a `scrollbar-none` opt-out, a `[data-custom-scrollbars='off']` escape hatch, and a coarse-pointer fallback to native overlay scrollbars.
- `ScrollArea` restyled into a subtle line thumb that animates opacity and shifts to the theme accent while scrolling; adds `scrollbarWidth` and `accent` props plus CSS-variable overrides, and is now touch-aware. `ScrollBar` is now exported.
- New `useScrollActivity` hook for driving a scrolling state on plain native `overflow` containers.
- `scilent-ui`: replaced dead `scrollbar-*` utility classes in `EntityPreview` with `custom-scrollbars`.
