#!/usr/bin/env bash
# Lifecycle script for local firebase emulators + e2e tests.
# Usage:
#   ./scripts/e2e-firebase.sh start   — start firebase emulators (auth + firestore)
#   ./scripts/e2e-firebase.sh test    — start emulators + run Playwright e2e
#   ./scripts/e2e-firebase.sh stop    — stop firebase emulators
set -euo pipefail
cd "$(dirname "$0")/.."
ACTION="${1:-test}"
PID_FILE=".firebase-emulator.pid"
EMULATOR_HOST="http://127.0.0.1:9099"

wait_for_emulator() {
  local max_wait=30
  local waited=0
  while ! curl -s -o /dev/null "$EMULATOR_HOST" 2>/dev/null; do
    if [ $waited -ge $max_wait ]; then
      echo "✗ Firebase emulator failed to start within ${max_wait}s" >&2
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
}

start_emulators() {
  cd sites/demo
  nohup bunx firebase emulators:start --only auth,firestore >../.firebase-emulator.log 2>&1 &
  local pid=$!
  cd ../..
  echo "$pid" > "$PID_FILE"
  echo -n "Starting firebase emulators..."
  if wait_for_emulator; then
    echo " ✓ (pid $pid)"
  else
    kill "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    return 1
  fi
}

stop_emulators() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      # Also kill child processes (java, etc.)
      pkill -P "$pid" 2>/dev/null || true
      echo "✓ firebase emulators stopped (pid $pid)"
    else
      echo "  firebase emulators already stopped"
    fi
    rm -f "$PID_FILE"
  else
    echo "  no firebase emulator PID file found"
  fi
}

case "$ACTION" in
  start)
    start_emulators
    ;;
  stop)
    stop_emulators
    ;;
  test)
    # Stop any existing emulators first
    stop_emulators 2>/dev/null || true
    start_emulators
    cd sites/showcase
    KAVACH_ADAPTER=firebase bunx playwright test
    EXIT=$?
    echo ""
    if [ $EXIT -eq 0 ]; then
      echo "✓ All tests passed — firebase emulators still running."
      echo "  Manual testing: cd sites/demo && bun run dev"
      echo "  Teardown:       bun run e2e:firebase:stop"
    else
      echo "✗ Tests failed — firebase emulators still running for debugging."
      echo "  Teardown: bun run e2e:firebase:stop"
    fi
    exit $EXIT
    ;;
  *)
    echo "Usage: $0 {start|test|stop}" >&2
    exit 1
    ;;
esac
