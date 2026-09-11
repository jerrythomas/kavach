#!/usr/bin/env bash
# Everything that must happen between the version bump and the release commit.
#
# Invoked from config/bump.config.js `execute`. It must stay a SINGLE command:
# bumpp tokenizes the execute string and spawns it without a shell, so `a && b`
# would run `a` with `&&` and `b` as arguments. This script is that one command;
# add steps here rather than chaining them in the config.
#
# `all: true` in the bump config stages whatever these steps touch, so the tag
# CI packs from carries the synced manifest and a correct lockfile.
set -euo pipefail

cd "$(dirname "$0")/.."

node scripts/sync-library-manifest.mjs
bash scripts/refresh-lockfile.sh
