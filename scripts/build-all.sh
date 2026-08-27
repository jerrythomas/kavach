#!/usr/bin/env bash
# Build every publishable workspace package, in dependency order.
#
# Order matters: adapters import `kavach`, and `kavach` imports the leaf
# packages. Each package resolves its dependencies through their published
# `exports`, which now point at `dist/` — so a dependency must be built before
# anything that imports it. The previous `find`-based script used filesystem
# order and skipped adapters entirely.
#
# Keep this list in step with the publish order in .github/workflows/publish.yml.
set -euo pipefail

cd "$(dirname "$0")/.."

PACKAGES=(
	packages/cookie
	packages/hashing
	packages/logger
	packages/query
	packages/sentry
	packages/auth
	packages/ui
	packages/vite
	packages/cli
	adapters/amplify
	adapters/auth0
	adapters/supabase
	adapters/firebase
	adapters/convex
)

for pkg in "${PACKAGES[@]}"; do
	if [ ! -f "$pkg/package.json" ]; then
		echo "::error::$pkg is listed for build but has no package.json"
		exit 1
	fi
	if ! node -p "require('./$pkg/package.json').scripts?.build ? 1 : 0" | grep -q 1; then
		echo "· $pkg — no build script, skipping"
		continue
	fi
	echo "▸ building $pkg"
	(cd "$pkg" && bun run build)
done

echo "✓ built ${#PACKAGES[@]} packages in dependency order"
