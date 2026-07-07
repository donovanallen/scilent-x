---
'@scilent-one/harmony-engine': patch
---

Improve Apple Music release-type detection. Since the Apple Music API has no
explicit EP flag, `mapAlbumType` now recognizes EPs from Apple's " - EP"/"(EP)"
title convention (and singles from the " - Single" suffix) in addition to the
`isSingle`/`isCompilation` flags, so EPs are no longer misclassified as albums.
