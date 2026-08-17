#!/usr/bin/env bash
# Lifecycle script for local convex dev server + e2e tests.
# Usage:
#   ./scripts/e2e-convex.sh start   — start convex dev server (local)
#   ./scripts/e2e-convex.sh test    — start server + run Playwright e2e
#   ./scripts/e2e-convex.sh stop    — stop convex dev server
set -euo pipefail
cd "$(dirname "$0")/.."
ACTION="${1:-test}"
PID_FILE=".convex-dev.pid"
CONVEX_URL="http://127.0.0.1:3210"

wait_for_convex() {
  local max_wait=60
  local waited=0
  while ! curl -s -o /dev/null "$CONVEX_URL" 2>/dev/null; do
    if [ $waited -ge $max_wait ]; then
      echo "✗ Convex dev server failed to start within ${max_wait}s" >&2
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
}

start_convex() {
  cd sites/demo
  nohup bunx convex dev --local >../.convex-dev.log 2>&1 &
  local pid=$!
  cd ../..
  echo "$pid" > "$PID_FILE"
  echo -n "Starting convex dev server..."
  if wait_for_convex; then
    echo " ✓ (pid $pid)"
  else
    kill "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    return 1
  fi
}

stop_convex() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      pkill -P "$pid" 2>/dev/null || true
      echo "✓ convex dev server stopped (pid $pid)"
    else
      echo "  convex dev server already stopped"
    fi
    rm -f "$PID_FILE"
  else
    echo "  no convex dev server PID file found"
  fi
}

case "$ACTION" in
  start)
    start_convex
    ;;
  stop)
    stop_convex
    ;;
  test)
    stop_convex 2>/dev/null || true
    start_convex
    cd sites/showcase
    KAVACH_ADAPTER=convex bunx playwright test
    EXIT=$?
    echo ""
    if [ $EXIT -eq 0 ]; then
      echo "✓ All tests passed — convex dev server still running."
      echo "  Manual testing: cd sites/demo && bun run dev"
      echo "  Teardown:       bun run e2e:convex:stop"
    else
      echo "✗ Tests failed — convex dev server still running for debugging."
      echo "  Teardown: bun run e2e:convex:stop"
    fi
    exit $EXIT
    ;;
  *)
    echo "Usage: $0 {start|test|stop}" >&2
    exit 1
    ;;
esac
