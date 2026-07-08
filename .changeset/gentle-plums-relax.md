---
'@scilent-one/ui': minor
'@scilent-one/scilent-ui': minor
---

Add a shared motion foundation and apply it across core UI primitives (Phase 1 of the global motion system).

- Migrated from the deprecated `tailwindcss-animate` plugin to `tw-animate-css` (Tailwind v4-native, CSS-first).
- Added a shared motion scale: named `duration-instant/fast/base/slow/slower` utilities and polished `ease-out`/`ease-in`/`ease-in-out` easing curves, wired through to both CSS transitions and `animate-in`/`animate-out` entrance/exit animations.
- Added `useReducedMotion` and `useInViewport` hooks, plus a `Reveal` component for IntersectionObserver-based fade/slide-in-view reveals with a capped stagger delay (skipped entirely under `prefers-reduced-motion`).
- Applied the new tokens to `Button` (press/hover feedback), `Dialog`, `Sheet`, `DropdownMenu`, `ContextMenu`, `Popover`, `HoverCard`, `Select`, `Tooltip` (consistent enter/exit timing), `Tabs`, `Switch`, and `Sidebar` (collapse/expand easing).
- Replaced `Skeleton`'s flat pulse with a shimmer sweep, falling back to the pulse under reduced motion.
- Standardized hover-lift/scale transitions across `AlbumArtwork`, `AlbumCard`, `TrackCard`, and `ArtistCard` on the shared tokens.
- Applied the `Reveal` stagger pattern to the web app's search results grid and the social feed's post list (reference implementations).

This is a visual-only, backwards-compatible change - no public component APIs changed shape (aside from the new `useReducedMotion`, `useInViewport`, and `Reveal` exports from `@scilent-one/ui`).
