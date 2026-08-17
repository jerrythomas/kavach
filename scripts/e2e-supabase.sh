#!/usr/bin/env bash
# Lifecycle script for local supabase stack + e2e tests.
# Usage:
#   ./scripts/e2e-supabase.sh start   — start supabase (Docker)
#   ./scripts/e2e-supabase.sh test    — run supabase + Playwright e2e
#   ./scripts/e2e-supabase.sh stop    — stop supabase
set -euo pipefail
cd "$(dirname "$0")/.."
ACTION="${1:-test}"

case "$ACTION" in
  start)
    supabase start
    echo "✓ supabase stack running on :54331"
    ;;
  stop)
    supabase stop
    echo "✓ supabase stack stopped"
    ;;
  test)
    supabase start
    cd sites/showcase
    KAVACH_ADAPTER=supabase bunx playwright test
    EXIT=$?
    echo ""
    if [ $EXIT -eq 0 ]; then
      echo "✓ All tests passed — supabase stack still running."
      echo "  Manual testing: cd sites/demo && bun run dev"
      echo "  Teardown:       bun run e2e:supabase:stop"
    else
      echo "✗ Tests failed — supabase stack still running for debugging."
      echo "  Teardown: bun run e2e:supabase:stop"
    fi
    exit $EXIT
    ;;
  *)
    echo "Usage: $0 {start|test|stop}" >&2
    exit 1
    ;;
esac
