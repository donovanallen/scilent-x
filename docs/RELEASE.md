# Versioning & Releases (Changesets)

- Add a changeset for any user-facing change in `packages/*`:  
  `changeset` → choose packages → pick bump (patch/minor/major) → write summary.  
  This creates a markdown file in `.changeset/`.

- Check pending releases locally: `changeset status`.

- Cut versions locally (optional, CI does this on release): `pnpm run version`  
  This bumps package versions, updates changelogs, and updates the lockfile.

- Publish (if/when packages are made public): `pnpm run release`. Private packages are skipped automatically.

- CI flows:
  - `Changeset Status` (PRs): comments when a PR needs a changeset.
  - `Release` (main): runs `changeset version` and `changeset publish` to create a release PR or publish artifacts.

- Ignored changes (excluded from versioning): App-only edits (e.g., `apps/web`) are ignored for versioning via `.changeset/config.json`.
