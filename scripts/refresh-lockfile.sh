#!/usr/bin/env bash
# Regenerate bun.lock so it records the CURRENT workspace versions.
#
# `bun pm pack` rewrites each `workspace:*` dependency using the version
# recorded for that workspace in bun.lock, not the version in the package's own
# package.json. A plain `bun install` does not refresh those records once they
# exist, so they froze at 1.0.1 and every release from 1.0.2 to 1.1.2 shipped
# internal `@kavach/*` deps pinned to 1.0.1. Deleting the lockfile first forces
# bun to record the versions that are actually on disk.
#
# Invoked from config/bump.config.js `execute`, after the version bump and
# before the release commit. It must stay a SINGLE command: bumpp tokenizes the
# execute string and spawns it without a shell, so `a && b` would run `a` with
# `&&` and `b` as arguments — which is exactly how v1.1.3 shipped with the
# lockfile deleted instead of regenerated.
set -euo pipefail

cd "$(dirname "$0")/.."

rm -f bun.lock
bun install --silent

if [ ! -f bun.lock ]; then
	echo "error: bun install did not produce a bun.lock" >&2
	exit 1
fi

version=$(node -p "require('./package.json').version")
recorded=$(node -e '
	const lock = require("fs").readFileSync("bun.lock", "utf8")
	const match = lock.match(/"packages\/cookie":\s*\{[^}]*"version":\s*"([^"]+)"/)
	process.stdout.write(match ? match[1] : "none")
')

if [ "$recorded" != "$version" ]; then
	echo "error: bun.lock records @kavach/cookie at ${recorded}, expected ${version}" >&2
	exit 1
fi

echo "✓ bun.lock regenerated at ${version}"
