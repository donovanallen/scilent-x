---
'@scilent-one/scilent-ui': minor
---

Expand entity interactions for review ingress:

- Make `InteractiveWrapper` platform-adaptive: it now opens a long-press dropdown menu on mobile (via the resolved `platform` config) in addition to the existing right-click context menu and hover preview on web. `EntityMenu` is deprecated in favor of `InteractiveWrapper`.
- Add an `onViewReviews` callback to `HarmonyInteractionConfig` and render a "See reviews" action alongside "Write review" in the track and album context menus.
- Add an `interactive` prop to `ArtistCredit` so credited artists can surface Harmony interactions, and thread `interactive` through `TrackList`, `AlbumTrackList`, and `ArtistDiscography` so nested entities inherit context menus and hover previews.
