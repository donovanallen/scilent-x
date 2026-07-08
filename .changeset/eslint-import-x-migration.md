---
---

Migrate `packages/tooling`'s ESLint config from `eslint-plugin-import` to the
maintained `eslint-plugin-import-x` fork for ESLint 10 support, and drop the
deprecated (no-op) `downlevelIteration` option from the shared base tsconfig.
No release needed: `packages/tooling` has no external consumers.
