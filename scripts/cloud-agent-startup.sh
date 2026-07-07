#!/usr/bin/env bash
# Cursor Cloud Agent startup hook: ensure the Node version pinned in
# .nvmrc is active in every shell the cloud agent opens.
#
# Ported and adapted from catalyst-ed/cams-web-client's
# scripts/cloud-agent-startup.sh (branch cursor/cams-cursor-plugin-53c9).
# Self-contained on purpose (no dependency on node_modules).
set -euo pipefail

if [[ -z "${NVM_DIR:-}" ]]; then
  export NVM_DIR="$HOME/.nvm"
fi

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "[cloud-agent-startup] nvm not found at $NVM_DIR/nvm.sh; skipping Node version bootstrap."
  exit 0
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

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

if node_version="$(resolve_node_version)"; then
  nvm install "$node_version"
  nvm use "$node_version"
  echo "[cloud-agent-startup] Active Node: $(node -v)"
else
  echo "[cloud-agent-startup] No .nvmrc or .node-version found; keeping current Node: $(node -v)"
fi

hook_file="$HOME/.cursor_cloud_agent_nvm_auto_use.sh"
cat > "$hook_file" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

if [[ "${CURSOR_CLOUD_AGENT_NVM_HOOK_RAN:-0}" == "1" ]]; then
  return 0 2>/dev/null || exit 0
fi
CURSOR_CLOUD_AGENT_NVM_HOOK_RAN=1

if [[ -z "${NVM_DIR:-}" ]]; then
  export NVM_DIR="$HOME/.nvm"
fi

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  return 0 2>/dev/null || exit 0
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

node_version=""
if [[ -f ".nvmrc" ]]; then
  node_version="$(tr -d "[:space:]" < ".nvmrc")"
elif [[ -f ".node-version" ]]; then
  node_version="$(tr -d "[:space:]" < ".node-version")"
fi

if [[ -n "$node_version" ]]; then
  nvm install "$node_version" >/dev/null 2>&1
  nvm use "$node_version" >/dev/null 2>&1
fi
HOOK
chmod +x "$hook_file"

ensure_shell_hook() {
  local shell_file="$1"
  local marker="# cursor_cloud_agent_nvm_auto_use"

  touch "$shell_file"
  if ! grep -qF "$marker" "$shell_file"; then
    {
      echo ""
      echo "$marker"
      echo "if [[ -f \"$hook_file\" ]]; then"
      echo "  . \"$hook_file\""
      echo "fi"
    } >> "$shell_file"
  fi
}

ensure_shell_hook "$HOME/.bashrc"
ensure_shell_hook "$HOME/.bash_profile"
