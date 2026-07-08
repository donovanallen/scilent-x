---
'@scilent-one/scilent-ui': patch
---

Fix provider icon visibility across themes. The Apple Music icon rendered blank
because its source SVGs declared explicit `width`/`height` alongside a matching
`viewBox`, so SVGO stripped the `viewBox` during the build and the 361-unit
artwork was drawn 1:1 into a 24px box; the fixed dimensions have been removed so
the `viewBox` is retained and the mark scales correctly.

Add a theme-aware `auto` `IconColor` and make it the default for `TidalIcon`.
Because Tidal ships only monochrome PNGs and the app themes via CSS-variable
tokens (not `dark:` utilities), the theme-aware path paints the PNG's alpha as a
CSS mask filled with `currentColor` (pinned to `--foreground`), so the logo stays
legible in both light and dark mode. `SpotifyIcon` and `AppleMusicIcon` also
accept `color="auto"` for the same theme-adaptive, monochrome behavior. Explicit
`black`/`white` colors are unchanged.
