#!/usr/bin/env bash
# Cursor Cloud Agent install hook: activate the Node version pinned in
# .nvmrc, enable corepack so the pnpm version pinned in package.json
# ("packageManager") is used, run a frozen pnpm install across the
# workspace, then generate the Prisma client so packages that depend on
# @scilent-one/db (and turbo's build/typecheck graph) work out of the box.
#
# Ported and adapted from catalyst-ed/cams-web-client's
# scripts/cloud-agent-install.sh (branch cursor/cams-cursor-plugin-53c9).
# Kept self-contained on purpose: it runs BEFORE `pnpm install`, so it
# cannot rely on anything inside node_modules.
set -euo pipefail

log() {
  printf '[cloud-agent-install] %s\n' "$*"
}

# nvm is the canonical way Node versions are managed on Cursor cloud
# agents. Fall back to whatever node is on PATH if nvm is missing so
# this script never blocks setup on environments without nvm.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

resolve_node_version() {
  if [[ -f ".nvmrc" ]]; then
    tr -d "[:space:]" < ".nvmrc"
    return 0
  fi
  if [[ -f ".node-version" ]]; then
    tr -d "[:space:]" < ".node-version"
    return 0
  fi
  return 1
}

if command -v nvm >/dev/null 2>&1; then
  if node_version="$(resolve_node_version)"; then
    log "activating Node ${node_version} via nvm"
    nvm install "$node_version" >/dev/null
    nvm use "$node_version" >/dev/null
  else
    log "no .nvmrc/.node-version found; using current Node $(node -v 2>/dev/null || echo 'not installed')"
  fi
fi

# Cursor cloud agents ship a sandbox node binary that stays first on PATH
# after `nvm use`, so explicitly prepend the active nvm bin (preferred)
# or the dir containing the resolved node binary. This guarantees `node`,
# `corepack`, and `pnpm` all run under the version pinned in .nvmrc.
if [[ -n "${NVM_BIN:-}" && -x "$NVM_BIN/node" ]]; then
  export PATH="$NVM_BIN:$PATH"
elif command -v node >/dev/null 2>&1; then
  node_bin="$(dirname "$(command -v node)")"
  export PATH="$node_bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  log "node not found on PATH; aborting" >&2
  exit 1
fi

log "node: $(node -v)"

if ! command -v corepack >/dev/null 2>&1; then
  log "corepack not found on PATH; aborting" >&2
  exit 1
fi

corepack enable >/dev/null

log "pnpm: $(corepack pnpm -v)"

log "running corepack pnpm install --frozen-lockfile"
corepack pnpm install --frozen-lockfile

# The Prisma client (packages/db/prisma/generated) is gitignored and only
# exists once `prisma generate` runs. Generate it here so turbo's build,
# typecheck, and test graphs (which depend on ^db:generate for apps/web)
# succeed on a fresh clone without a live DATABASE_URL — `prisma generate`
# only reads the schema, it does not connect to the database.
log "generating Prisma client (@scilent-one/db)"
corepack pnpm --filter @scilent-one/db run db:generate || {
  log "WARN: prisma generate failed; packages/apps depending on @scilent-one/db may need it re-run manually" >&2
}
