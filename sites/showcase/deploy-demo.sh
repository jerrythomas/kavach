#!/usr/bin/env bash
# Builds + deploys one per-adapter demo site to Cloudflare Workers.
#
# Usage:
#   ./sites/showcase/deploy-demo.sh supabase|firebase|convex
#
# Requires:
#   - wrangler authenticated (bunx wrangler whoami) or CLOUDFLARE_API_TOKEN /
#     CLOUDFLARE_ACCOUNT_ID set
#   - sites/demo/.env.<adapter> with the adapter's PUBLIC_* values and
#     KAVACH_ADAPTER (falls back to .env.production, then .env)
#
# Steps:
#   1. Loads the adapter env, builds sites/demo with KAVACH_ADAPTER set
#      (WORKERS_CI=1 so @sveltejs/adapter-cloudflare emits .svelte-kit/cloudflare/)
#   2. wrangler deploy -c sites/demo/wrangler.<adapter>.jsonc
#   3. Optionally binds the custom domain (<adapter>.kavach.sensei-hq.com)
#
# Set SKIP_DEPLOY=1 to only build (no wrangler calls). Set SKIP_DOMAIN=1 to
# deploy without touching the custom domain.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEMO_DIR="$REPO_ROOT/sites/demo"

ADAPTER="${1:-}"
DOMAIN_SUFFIX="kavach.sensei-hq.com"

if [[ -z "$ADAPTER" ]]; then
  echo "Usage: $0 supabase|firebase|convex" >&2
  exit 1
fi

case "$ADAPTER" in
  supabase|firebase|convex) ;;
  *)
    echo "Unsupported adapter: $ADAPTER (live demos: supabase, firebase, convex)." >&2
    echo "Auth0/Amplify have no demo deploy yet — the vite auth generator only emits" >&2
    echo "supabase/firebase/convex modules (see packages/vite/src/generate.js)." >&2
    exit 1
    ;;
esac

ENV_FILE="$DEMO_DIR/.env.$ADAPTER"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE="$DEMO_DIR/.env.production"
fi
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE="$DEMO_DIR/.env"
fi
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file. Create $DEMO_DIR/.env.$ADAPTER (see .env.example)." >&2
  exit 1
fi

# Load build-time env: KAVACH_ADAPTER + PUBLIC_* (also VITE_* if any).
set -a
# shellcheck disable=SC1090
source <(sed -E '/^[[:space:]]*(#|$)/d; s/^export[[:space:]]+//' "$ENV_FILE")
set +a
export KAVACH_ADAPTER="${KAVACH_ADAPTER:-$ADAPTER}"
export WORKERS_CI="${WORKERS_CI:-1}"

echo "==> Building sites/demo for adapter: $KAVACH_ADAPTER (env: $ENV_FILE)"
(
  cd "$DEMO_DIR"
  bun run build
)

if [[ "${SKIP_DEPLOY:-0}" == "1" ]]; then
  echo "==> SKIP_DEPLOY=1 — build only. Output: $DEMO_DIR/.svelte-kit/cloudflare"
  exit 0
fi

echo "==> Deploying worker: kavach-$ADAPTER"
(
  cd "$DEMO_DIR"
  bunx wrangler deploy -c "wrangler.$ADAPTER.jsonc"
)

if [[ "${SKIP_DOMAIN:-0}" != "1" ]]; then
  DOMAIN="$ADAPTER.$DOMAIN_SUFFIX"
  echo "==> Binding custom domain: $DOMAIN"
  (
    cd "$DEMO_DIR"
    bunx wrangler domains add "kavach-$ADAPTER" "$DOMAIN" || echo "Domain bind failed (already bound?) — check: bunx wrangler domains list" >&2
  )
fi

echo "==> Done. Demo: https://$ADAPTER.$DOMAIN_SUFFIX"
