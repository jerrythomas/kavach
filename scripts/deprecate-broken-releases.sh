#!/usr/bin/env bash
# Deprecate the published versions that are genuinely defective.
#
# Requires an npm login with publish rights: `npm login` first, then run this.
# Deprecation is reversible — see the un-deprecate section at the bottom.
#
# Scope was derived by inspecting every published stable version's manifest and
# source, not by assuming a cutoff. Two defect classes:
#
#   1. `kavach` shipped `"kit-monorepo": "sveltejs/kit"`, a dependency on the
#      whole SvelteKit monorepo. npm dies on its `catalog:` protocol, so
#      `npm install kavach` failed outright for 1.0.0 through 1.1.2.
#
#   2. `bun pm pack` rewrote `workspace:*` from a stale bun.lock, so packages
#      shipped sibling deps pinned to 1.0.1 (or 1.0.0-next.37). A consumer got
#      pre-fix siblings regardless of which version they asked for.
#
#   Plus the ESM defect: relative imports without extensions, and TypeScript
#   entry points Node cannot load at any extension.
#
# NOT deprecated — verified clean at every version, no dep defects and no
# extensionless imports: @kavach/cookie, @kavach/hashing, @kavach/query,
# @kavach/vite. Deprecating those would be false.
#
# Prerelease versions (1.0.0-next.*) are left alone; they are already superseded
# and semver ranges below exclude them.
set -euo pipefail

FIX="Upgrade to 1.1.3."

echo "▸ kavach — uninstallable (git dep on sveltejs/kit) + stale siblings"
npm deprecate "kavach@>=1.0.0 <1.1.3" \
	"Broken: depends on the sveltejs/kit git monorepo so 'npm install' fails, and pins @kavach/* siblings to 1.0.1. $FIX"

for adapter in amplify auth0 convex firebase supabase; do
	echo "▸ @kavach/adapter-$adapter — TypeScript entry + depends on uninstallable kavach"
	npm deprecate "@kavach/adapter-$adapter@>=1.0.0 <1.1.3" \
		"Broken: entry point is TypeScript so it cannot be imported under Node ESM, and it depends on an uninstallable kavach. $FIX"
done

echo "▸ @kavach/ui — depends on uninstallable kavach"
npm deprecate "@kavach/ui@>=1.0.0 <1.1.3" \
	"Broken: depends on an uninstallable kavach (1.0.1). $FIX"

echo "▸ @kavach/sentry — extensionless imports through 1.1.1; 1.1.2 pulls broken logger@1.0.1"
npm deprecate "@kavach/sentry@>=1.0.0 <1.1.3" \
	"Broken: relative imports lack file extensions so it fails under Node ESM, and it pins @kavach/logger to 1.0.1. $FIX"

# 1.1.2 is genuinely clean for logger — extension-correct and no sibling deps —
# so the range stops at 1.1.1 rather than sweeping it in.
echo "▸ @kavach/logger — extensionless imports through 1.1.1 (1.1.2 is clean, left alone)"
npm deprecate "@kavach/logger@>=1.0.0 <1.1.2" \
	"Broken: relative imports lack file extensions so it fails under Node ESM. $FIX"

echo "▸ @kavach/cli — pins @kavach/vite to 1.0.1"
npm deprecate "@kavach/cli@>=1.0.0 <1.1.3" \
	"Ships a stale @kavach/vite (1.0.1) instead of the matching version. $FIX"

echo
echo "✓ done — verify with: npm view kavach@1.1.2 deprecated"
echo
echo "To undo any of these, re-run with an empty message, e.g.:"
echo '  npm deprecate "kavach@>=1.0.0 <1.1.3" ""'
