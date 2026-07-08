---
'@scilent-one/harmony-engine': patch
---

Fix Apple Music catalog requests when the configured storefront is an empty
string. `AppleMusicProvider` now falls back to `'us'` for empty/blank storefront
values (previously only `undefined` triggered the default), preventing malformed
`/v1/catalog//search` requests that silently returned no results. Additionally,
`LookupCoordinator` now logs a warning when a provider's search rejects, so
provider failures are no longer indistinguishable from genuine empty results.
